import type {
	GetObjectCommandInput,
	GetObjectCommandOutput,
	HeadObjectCommandInput,
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
import { Err, Ok, type Result } from 'neverthrow';

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
	userId: string,
	dataName: string,
	expiresIn = 60 * 60,
) {
	const key = await generateR2Hash(userId, dataName);

	return await getSignedUrl(
		R2,
		new GetObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
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
): Promise<Result<string, undefined>> {
	const key = await generateR2Hash(userId, dataName);

	const url = await getSignedUrl(
		R2,
		new PutObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: key,
		}),
		{ expiresIn },
	);
	if (url) {
		return new Ok(url);
	}
	return new Err(undefined);
}

// データを一時urlなしで取得
export async function existFile(
	userId: string,
	fileName: string,
): Promise<boolean> {
	try {
		const key = await generateR2Hash(userId, fileName);

		const headParams: HeadObjectCommandInput = {
			Bucket: process.env.R2_BUCKET_NAME,
			Key: key,
		};

		const command = new HeadObjectCommand(headParams);
		const response = await R2.send(command);
		if (response) {
			return true;
		}
		return false;
	} catch (error: unknown) {
		if (isNotFoundError(error)) {
			return false;
		} else {
			throw error;
		}
	}
}
// 型ガード関数を定義
function isNotFoundError(
	error: unknown,
): error is { name: string; $fault: string } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'name' in error &&
		'name' in error &&
		(error as { name: string }).name === 'NotFound'
	);
}
export async function getFile(
	userId: string,
	fileName: string,
): Promise<Result<GetObjectCommandOutput, undefined>> {
	try {
		const key = await generateR2Hash(userId, fileName);

		const getParams: GetObjectCommandInput = {
			Bucket: process.env.R2_BUCKET_NAME,
			Key: key,
		};

		const command = new GetObjectCommand(getParams);
		const response = await R2.send(command);

		if (response.Body === undefined) {
			return new Err(undefined);
		}

		return new Ok(response);
	} catch (error) {
		console.error(error);
		return new Err(undefined);
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
			Bucket: process.env.R2_BUCKET_NAME,
			Key: key,
			Body: data,
			ContentType: 'application/gzip',
		};

		const command = new PutObjectCommand(putParams);
		const response = await R2.send(command);

		return response;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}
