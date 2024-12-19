import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';

import { generateR2Hash } from '@seller-kanrikun/calc/r2';
import { createClient } from '@seller-kanrikun/db';
import { session } from '@seller-kanrikun/db/schema';

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
	const key = await generateR2Hash(userId, dataName);

	console.log(userId, key);

	return await getSignedUrl(
		R2,
		new GetObjectCommand({
			Bucket: bucket,
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
			Bucket: 'seller-kanrikun',
			Key: key,
		}),
		{ expiresIn },
	);
}

export async function getApi(
	request: Request,
	fileName: string,
): Promise<Response> {
	const auth = await authorizeSession(request);
	if (auth instanceof Response) {
		return auth;
	}

	// 読み込み専用の署名付きURLを取得
	const getUrl = await getReadOnlySignedUrl(auth, fileName);

	const getRes = await fetch(getUrl);

	if (!getRes.ok) {
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
): Promise<Response> {
	const auth = await authorizeSession(request);
	if (request.body === null) {
		return new Response('Need data to upload in the request body', {
			status: 403,
			statusText: 'Forbidden',
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	}
	if (auth instanceof Response) {
		return auth;
	}

	// 読み込み専用の署名付きURLを取得
	const putUrl = await getWriteOnlySignedUrl(auth, fileName);

	const putRes = await fetch(putUrl, {
		method: 'PUT',
		body: request.body,
	});

	if (!putRes.ok) {
		return new Response('Server Error', {
			status: 500,
		});
	}
	return new Response(putRes.body, {
		status: 200,
		statusText: 'OK',
		headers: {
			'Content-Type': 'application/octet-stream',
		},
	});
}

export async function authorizeSession(
	request: Request,
): Promise<Response | string> {
	// セッションIDを取得
	const sessionId = request.headers.get('x-seller-kanrikun-session-id');
	if (!sessionId) return returnUnauthorized(); // セッションIDがない場合はエラー
	// dbクライアントを作成
	const db = createClient({
		url: process.env.TURSO_CONNECTION_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	});
	// セッションIDからセッションデータを取得
	const sessionData = await db
		.select()
		.from(session)
		.where(eq(session.id, sessionId))
		.get();
	if (!sessionData) return returnUnauthorized(); // セッションデータがない場合はエラー
	if (sessionData.expiresAt < new Date()) return returnUnauthorized(); // セッションが期限切れの場合はエラー

	return sessionData.userId;
}

function returnUnauthorized() {
	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}
