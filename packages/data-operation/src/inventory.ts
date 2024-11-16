import type { ClientType } from '@seller-kanrikun/db';
import { account } from '@seller-kanrikun/db/schema';
import { eq } from 'drizzle-orm';
import type { InventorySummariesResponse } from '~/types';

export async function getInventoryData(db: ClientType) {
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
	console.log(summaries);

	return new Response('ok');
}
