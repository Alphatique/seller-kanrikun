import type { CatalogItemsResponse } from '../../types';

export async function getCatalogData(accessToken: string) {
	const response = await fetch(
		'https://sellingpartnerapi-fe.amazon.com/catalog/2022-04-01/items?identifiersType=ASIN&identifiers=B06ZXXQGZ8&marketplaceIds=A1VC38T7YXB528',
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);

	const responseData = (await response.json()) as CatalogItemsResponse;

	console.log(responseData);
	console.log(responseData.items[0]);
	console.log(responseData.items[0].summaries);
	console.log(responseData.items[0].summaries[0].browseClassification);

	return responseData;
}
