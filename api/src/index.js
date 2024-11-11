import { account, createDbClient } from '@seller-kanrikun/db';
import { Hono } from 'hono';
const app = new Hono();
app.get('/', async c => {
	const { db } = await createDbClient(
		c.env.TURSO_CONNECTION_URL,
		c.env.TURSO_AUTH_TOKEN,
	);
	const result = await db.select().from(account).all();
	console.log(result);
	return c.text('Heno Hono!');
});
export default app;
