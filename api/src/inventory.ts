import { account } from '@seller-kanrikun/db';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { CustomVariables, InventorySummariesResponse } from '~/types';

const app = new Hono<{
	Bindings: CloudflareBindings;
	Variables: CustomVariables;
}>();

app.get('/all', async c => {
	const db = c.get('DB');

	const accounts = await db
		.select()
		.from(account)
		.where(eq(account.providerId, 'seller-central'))
		.all();

	const eachAccount = accounts[0];

	const inventory = await fetch(
		'https://sellingpartnerapi-fe.amazon.com/fba/inventory/v1/summaries?marketplaceIds=A1VC38T7YXB528&granularityType=Marketplace&granularityId=A1VC38T7YXB528',
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': eachAccount.accessToken!,
			},
		},
	);
	const inventoryData: InventorySummariesResponse = await inventory.json();
	console.log(inventoryData);
	const summaries = inventoryData.payload.inventorySummaries;

	return new Response('ok');
});

export default app;
