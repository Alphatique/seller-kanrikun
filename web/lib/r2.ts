import type {
	GetObjectCommandInput,
	GetObjectCommandOutput,
	PutObjectAclCommandInput,
	PutObjectCommandInput,
	PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import {
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { auth } from '@seller-kanrikun/auth/server';
import { generateR2Hash } from '@seller-kanrikun/data-operation/r2';

const bucketName = 'seller-kanrikun';
export const japanMarketPlaceId = 'A1VC38T7YXB528';
export const settlementReportFileName = 'settlement-report.tsv.gz';
export const salesTrafficReportFileName = 'sales-traffic-report.tsv.gz';
export const inventorySummariesFileName = 'inventory-summaries.tsv.gz';
export const catalogItemsFileName = 'catalog-items.tsv.gz';
export const costPriceFileName = 'cost-price.tsv.gz';

export const R2 = new S3Client({
	region: 'auto',
	endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
	credentials: {
		accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
		secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
	},
});

// 読み込み専用ダウンロード用url取得関数
export async function getReadOnlySignedUrl(
	userId: string,
	dataName: string,
	expiresIn = 60 * 60,
) {
	const key = await generateR2Hash(userId, dataName);

	console.log(userId, key);

	return await getSignedUrl(
		R2,
		new GetObjectCommand({
			Bucket: bucketName,
			Key: key,
		}),
		{ expiresIn },
	);
}

// 書き込み専用アップロード用url取得関数
export async function getWriteOnlySignedUrl(
	userId: string,
	dataName: string,
	expiresIn = 60,
) {
	const key = await generateR2Hash(userId, dataName);

	return await getSignedUrl(
		R2,
		new PutObjectCommand({
			Bucket: bucketName,
			Key: key,
		}),
		{ expiresIn },
	);
}

// ファイル存在チェック関数
export async function doesFileExist(
	userId: string,
	dataName: string,
): Promise<boolean> {
	const key = await generateR2Hash(userId, dataName);
	const result = new Promise<boolean>(resolve => {
		R2.send(
			new HeadObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		)
			.then(response => {
				console.log(response);
				resolve(true);
			})
			.catch(error => {
				console.log(error);
				resolve(false);
			});
	});

	return result;
}

export async function getApi(
	request: Request,
	fileName: string,
): Promise<Response> {
	const session = await auth.api.getSession({
		headers: request.headers,
	});
	if (!session) return returnUnauthorized();

	// 読み込み専用の署名付きURLを取得
	const getUrl = await getReadOnlySignedUrl(session.user.id, fileName);

	const getRes = await fetch(getUrl);

	if (!getRes.ok) {
		if (getRes.status === 404) {
			return new Response('Request file was not found', {
				status: 500,
			});
		}
		return new Response('Server Error', {
			status: 500,
		});
	}

	const data = await getRes.arrayBuffer();

	return new Response(data, {
		headers: {
			'Content-Type': 'application/octet-stream',
		},
	});
}

export async function putApi(
	request: Request,
	fileName: string,
	getPutData: (userId: string) => Promise<ArrayBuffer | null>,
): Promise<Response> {
	const session = await auth.api.getSession({
		headers: request.headers,
	});
	if (!session) return returnUnauthorized();

	if (request.body === null) {
		return new Response('Need data to upload in the request body', {
			status: 403,
			statusText: 'Forbidden',
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	}

	// 読み込み専用の署名付きURLを取得
	const putUrl = await getWriteOnlySignedUrl(session.user.id, fileName);

	const putData = await getPutData(session.user.id);
	if (putData === null) {
		return new Response('Missing or malformed data', {
			status: 403,
		});
	}

	const putRes = await fetch(putUrl, {
		method: 'PUT',
		body: putData,
	});

	if (!putRes.ok) {
		return new Response('Server Error', {
			status: 500,
		});
	}
	return new Response('ok');
}

export function returnUnauthorized() {
	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}

// データを一時urlなしで取得
export async function getFile(
	userId: string,
	fileName: string,
): Promise<GetObjectCommandOutput | undefined> {
	try {
		const key = await generateR2Hash(userId, fileName);

		const getParams: GetObjectCommandInput = {
			Bucket: bucketName,
			Key: key,
		};

		const command = new GetObjectCommand(getParams);
		const response = await R2.send(command);

		if (response.Body === undefined) {
			return undefined;
		}

		return response;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}

// データを一時urlなしでアップロード
export async function putFile(
	userId: string,
	fileName: string,
	data: Uint8Array | undefined,
): Promise<PutObjectCommandOutput | undefined> {
	try {
		const key = await generateR2Hash(userId, fileName);
		const putParams: PutObjectCommandInput = {
			Bucket: bucketName,
			Key: key,
			Body: data,
			ContentType: 'application/gzip',
		};

		const command = new PutObjectCommand(putParams);
		const response = await R2.send(command);

		console.log(response);

		return response;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}
