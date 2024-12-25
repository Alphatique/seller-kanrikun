import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

import { auth } from '@seller-kanrikun/auth/server';
import { type ClientType, createClient } from '@seller-kanrikun/db/index';

import { getSpApiAccessToken } from '~/lib/token';

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
