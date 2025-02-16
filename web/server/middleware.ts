import { createMiddleware } from 'hono/factory';

import { auth } from '@seller-kanrikun/auth/server';
import { type ClientType, createClient } from '@seller-kanrikun/db/index';
// ※ 不要な import がないか確認してください

import { getSpApiAccessToken } from '~/lib/token';

// ── CRON 用認証ミドルウェア ───────────────────────────────────────────
export const cronAuthMiddleware = createMiddleware(async (c, next) => {
	const authorizationHeader = c.req.header('authorization');

	if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
		return c.text('Unauthorized', 401);
	}

	if (authorizationHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return c.text('Forbidden', 403);
	}
	await next();
});

// ── ユーザー認証ミドルウェア ───────────────────────────────────────────
export const authMiddleware = createMiddleware<{
	Variables: {
		session: typeof auth.$Infer.Session;
		user: typeof auth.$Infer.Session.user;
	};
}>(async (c, next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ error: 'unauthorized' }, 401);
	}

	// セッションとユーザー情報をセット
	c.set('session', session);
	c.set('user', session.user);

	// --- IPアドレス取得・ログ出力（追加分） ---
	const xff = c.req.header('x-forwarded-for'); // 通常の転送ヘッダ
	const cfIP = c.req.header('CF-Connecting-IP'); // Cloudflare など
	const realIP = c.req.header('X-Real-IP'); // Nginx Reverse Proxy など
	const ip = xff ?? cfIP ?? realIP ?? 'unknown';

	console.log(
		`[Access Log] userId=${session.user.id}, ip=${ip}, path=${c.req.path}`,
	);
	// --- ここまで ---

	await next();
});

// ── データベース接続ミドルウェア ──────────────────────────────────────
export const dbMiddleware = createMiddleware<{
	Variables: {
		db: ClientType;
	};
}>(async (c, next) => {
	if (!c.var.db) {
		const url = process.env.TURSO_CONNECTION_URL;
		const authToken = process.env.TURSO_AUTH_TOKEN;
		if (!url || !authToken) {
			throw new Error(
				'Missing database configuration in environment variables.',
			);
		}

		const db = createClient({
			url,
			authToken,
		});

		c.set('db', db);
	}

	await next();
});

// ── SP API アクセストークン取得ミドルウェア ─────────────────────────────
// ※ ここでは db と user が必須であることを明示しています。
export const accessTokenMiddleware = createMiddleware<{
	Variables: {
		spApiAccessToken: string;
		db: ClientType;
		user: typeof auth.$Infer.Session.user;
	};
}>(async (c, next) => {
	if (!c.var.db) {
		throw new Error('Database client is missing.');
	}
	if (!c.var.user) {
		throw new Error('User information is missing.');
	}

	const accessToken = await getSpApiAccessToken(c.var.user.id, c.var.db);
	c.set('spApiAccessToken', accessToken);

	await next();
});
