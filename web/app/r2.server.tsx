import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
	bucket = 'seller-kanrikun',
	expiresIn = 60 * 60,
) {
	const key = await generateHash(userId, dataName);

	return await getSignedUrl(
		R2,
		new GetObjectCommand({
			Bucket: bucket,
			Key: key,
		}),
		{ expiresIn },
	);
}

// 原価を書き込み専用アップロード用url取得関数
export async function getPriceWriteOnlySignedUrl(
	userId: string,
	expiresIn = 60,
) {
	const key = await generateHash(userId, 'price.parquet');

	return await getSignedUrl(
		R2,
		new PutObjectCommand({
			Bucket: 'seller-kanrikun',
			Key: key,
		}),
		{ expiresIn },
	);
}

async function generateHash(userId: string, dataName: string) {
	const rawString = `${userId}/${dataName}`;
	const encoder = new TextEncoder();
	const data = encoder.encode(rawString);
	// SHA-256 でハッシュ化
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	// 16進文字列に変換
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
