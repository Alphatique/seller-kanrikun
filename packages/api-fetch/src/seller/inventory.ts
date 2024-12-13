import { fbaInventoryClient } from '@seller-kanrikun/sp-api/client/fba-inventory';
import type { operations } from '@seller-kanrikun/sp-api/schema/fba-inventory';
import type { Middleware } from 'openapi-fetch';

export async function getInventoryData(accessToken: string) {
	const middleware: Middleware = {
		async onRequest({ request, options }) {
			request.headers.set('x-amz-access-token', accessToken);
			return request;
		},
	};

	const params: operations['getInventorySummaries']['parameters'] = {
		query: {
			granularityType: 'Marketplace',
			granularityId: 'A1VC38T7YXB528', // 対象マーケットプレイスID（例：US）
			marketplaceIds: ['A1VC38T7YXB528'],
		},
	};

	fbaInventoryClient.use(middleware);
	const response = await fbaInventoryClient.GET(
		'/fba/inventory/v1/summaries',
		{
			params: params,
		},
	);

	fbaInventoryClient.eject(middleware);

	console.log(response);
	/*
	const inventory = await fetch(
		'https://sellingpartnerapi-fe.amazon.com/fba/inventory/v1/summaries?marketplaceIds=A1VC38T7YXB528&granularityType=Marketplace&granularityId=A1VC38T7YXB528',
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);
	const inventoryData: InventorySummariesResponse =
		(await inventory.json()) as InventorySummariesResponse;
	console.log(inventoryData);
	const summaries = inventoryData.payload.inventorySummaries;
	console.log(summaries);
*/

	return new Response('ok');
}
