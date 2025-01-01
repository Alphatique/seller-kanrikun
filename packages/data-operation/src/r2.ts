import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import type {
	GetObjectCommandInput,
	GetObjectCommandOutput,
	PutObjectCommandInput,
	PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { gunzipSync, gzipSync } from 'fflate';
import { ResultAsync } from 'neverthrow';

export async function generateR2Hash(
	userId: string,
	dataName: string,
): Promise<string> {
	const rawString = `${userId}/${dataName}`;
	const encoder = new TextEncoder();
	const data = encoder.encode(rawString);
	// SHA-256 でハッシュ化
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	// 16進文字列に変換
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
	return hashHex;
}

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
	bucketName: string,
	userId: string,
	dataName: string,
	expiresIn = 60 * 60,
) {
	const key = await generateR2Hash(userId, dataName);

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
	bucketName: string,
	userId: string,
	dataName: string,
	expiresIn = 60,
) {
	const key = await generateR2Hash(userId, dataName);

	return ResultAsync.fromPromise(
		getSignedUrl(
			R2,
			new PutObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
			{ expiresIn },
		),
		error => new Error(`Failed to get signed url: ${error}`),
	);
}

// データを一時urlなしで取得
export async function getFile(
	bucketName: string,
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
	bucketName: string,
	userId: string,
	fileName: string,
	data: Uint8Array,
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
