import type { createClient } from '@libsql/client';
import { createDbClient } from '@seller-kanrikun/db';
import type { drizzle } from 'drizzle-orm/libsql';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { CustomVariables } from '~/types';

import catalog from './catalog';
import inventory from './inventory';
import reports from './reports';

const app = new Hono<{
	Bindings: CloudflareBindings;
	Variables: CustomVariables;
}>();

app.use('*', async (c, next) => {
	const corsMiddleware = cors({
		origin: c.env.MY_WEB_ORIGIN,
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		credentials: true,
	});

	const dbClient: {
		client: ReturnType<typeof createClient>;
		db: ReturnType<typeof drizzle>;
	} = createDbClient(c.env.TURSO_CONNECTION_URL!, c.env.TURSO_AUTH_TOKEN!);

	c.set('DB', dbClient.db);
	return corsMiddleware(c, next);
});

app.get('/hello', async c => {
	return new Response('Heno, world!');
});

app.route('/reports', reports);
app.route('/inventory', inventory);
app.route('/catalog', catalog);

export default app;
