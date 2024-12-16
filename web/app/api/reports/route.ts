import { createClient } from '@seller-kanrikun/db';
import { session } from '@seller-kanrikun/db/schema';
import { eq } from 'drizzle-orm';
import { getReadOnlySignedUrl } from '../r2';

export async function GET(request: Request): Promise<Response> {
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

	// 読み込み専用の署名付きURLを取得
	const getUrl = await getReadOnlySignedUrl(
		sessionData.userId,
		'settlement-report.tsv.gz',
	);

	const getData = await fetch(getUrl);

	if (!getData.ok) {
		return new Response('Server Error', {
			status: 500,
		});
	}

	const data = await getData.text();

	return new Response(data, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}

function returnUnauthorized() {
	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}
