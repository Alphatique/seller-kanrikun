import { eq } from 'drizzle-orm/expressions';
import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

import { auth } from '@seller-kanrikun/auth/server';
import { type ClientType, createClient } from '@seller-kanrikun/db/index';
import { type User, user } from '@seller-kanrikun/db/schema';

import { getSpApiAccessToken } from '~/lib/token';

export const userHeaderMiddleware = createMiddleware<{
	Variables: {
		user: typeof auth.$Infer.Session.user;
	} & (typeof dbMiddleware extends MiddlewareHandler<infer Env>
		? Env['Variables']
		: // biome-ignore lint/complexity/noBannedTypes:
			{});
}>(async (c, next) => {
	if (!c.var.db) throw new Error();
	const cronUserIdHeader = c.req.header('X-Cron-UserId');
	if (!cronUserIdHeader) {
		return c.text('Unauthorized', 401);
	}

	const result = await c.var.db
		.select()
		.from(user)
		.where(eq(user.id, cronUserIdHeader))
		.limit(1);
	if (result.length <= 0) {
		return c.text('Forbidden', 403);
	}

	c.set('user', result[0]);
	await next();
});

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
		return c.json(
			{
				error: 'unauthorized',
			},
			401,
		);
	}

	c.set('session', session);
	c.set('user', session.user);

	await next();
});

export const dbMiddleware = createMiddleware<{
	Variables: {
		db: ClientType;
	};
}>(async (c, next) => {
	if (!c.var.db) {
		const db = createClient({
			url: process.env.TURSO_CONNECTION_URL!,
			authToken: process.env.TURSO_AUTH_TOKEN!,
		});

		c.set('db', db);
	}

	await next();
});

export const accessTokenMiddleware = createMiddleware<{
	Variables: {
		spApiAccessToken: string;
	} & (typeof dbMiddleware extends MiddlewareHandler<infer Env>
		? Env['Variables']
		: // biome-ignore lint/complexity/noBannedTypes:
			{}) &
		(typeof authMiddleware extends MiddlewareHandler<infer Env>
			? Env['Variables']
			: // biome-ignore lint/complexity/noBannedTypes:
				{});
}>(async (c, next) => {
	if (!c.var.db || !c.var.user) throw new Error();

	const accessToken = await getSpApiAccessToken(c.var.user.id, c.var.db);

	c.set('spApiAccessToken', accessToken);

	await next();
});
