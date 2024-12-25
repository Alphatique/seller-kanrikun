import { createMiddleware } from 'hono/factory';

import { auth } from '@seller-kanrikun/auth/server';
import { type ClientType, createClient } from '@seller-kanrikun/db/index';

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
	const db = createClient({
		url: process.env.TURSO_CONNECTION_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	});

	c.set('db', db);

	await next();
});
