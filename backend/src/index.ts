import { Hono } from 'hono';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get('/', c => {
	return c.text('Heno Hono!');
});

export default app;
