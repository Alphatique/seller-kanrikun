import { createClient } from '@seller-kanrikun/db';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { MyHonoInitializer } from '~/types';

import catalog from './catalog';
import inventory from './inventory';
import reports from './reports';

const app = new Hono<MyHonoInitializer>();

app.use('*', async (c, next) => {
	const corsMiddleware = cors({
		origin: c.env.MY_WEB_ORIGIN,
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		credentials: true,
	});

	const db = createClient({
		url: c.env.TURSO_CONNECTION_URL!,
		authToken: c.env.TURSO_AUTH_TOKEN!,
	});

	c.set('DB', db);
	return corsMiddleware(c, next);
});

app.get('/hello', async c => {
	return new Response('Heno, world!');
});

app.route('/reports', reports);
app.route('/inventory', inventory);
app.route('/catalog', catalog);

export default app;