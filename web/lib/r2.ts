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
import { ResultAsync } from 'neverthrow';

import { auth } from '@seller-kanrikun/auth/server';
import { generateR2Hash } from '@seller-kanrikun/data-operation/r2';

import { R2_BUCKET_NAME } from './constants';

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

	return await getSignedUrl(
		R2,
		new GetObjectCommand({
			Bucket: R2_BUCKET_NAME,
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

	return ResultAsync.fromPromise(
		getSignedUrl(
			R2,
			new PutObjectCommand({
				Bucket: R2_BUCKET_NAME,
				Key: key,
			}),
			{ expiresIn },
		),
		error => {
			new Error(`Failed to get signed url: ${error}`);
		},
	);
}

// データを一時urlなしで取得
export async function getFile(
	userId: string,
	fileName: string,
): Promise<GetObjectCommandOutput | undefined> {
	try {
		const key = await generateR2Hash(userId, fileName);

		const getParams: GetObjectCommandInput = {
			Bucket: R2_BUCKET_NAME,
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
	data: Uint8Array,
): Promise<PutObjectCommandOutput | undefined> {
	try {
		const key = await generateR2Hash(userId, fileName);
		const putParams: PutObjectCommandInput = {
			Bucket: R2_BUCKET_NAME,
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
