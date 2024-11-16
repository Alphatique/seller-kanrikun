import type { InventorySummariesResponse } from '~/types';

export async function getInventoryData(accessToken: string) {
	const inventory = await fetch(
		'https://sellingpartnerapi-fe.amazon.com/fba/inventory/v1/summaries?marketplaceIds=A1VC38T7YXB528&granularityType=Marketplace&granularityId=A1VC38T7YXB528',
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);
	const inventoryData: InventorySummariesResponse = await inventory.json();
	console.log(inventoryData);
	const summaries = inventoryData.payload.inventorySummaries;
	console.log(summaries);

	return new Response('ok');
}
