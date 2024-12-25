import { createMiddleware } from 'hono/factory';

import { auth } from '@seller-kanrikun/auth/server';

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
