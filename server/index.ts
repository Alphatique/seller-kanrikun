import { Hono } from 'hono';

export const app = new Hono();

app.get('/api/hello', c => c.text('Hello, world!'));

export default app;
