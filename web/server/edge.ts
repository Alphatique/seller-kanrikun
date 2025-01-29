import { Hono } from 'hono';

export const app = new Hono().basePath('/api/edge');

const route = app.get('/', async c => {
	return new Response('ok', {
		status: 200,
	});
});

export type RouteType = typeof route;
