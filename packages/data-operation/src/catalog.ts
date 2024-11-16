import type { ClientType } from '@seller-kanrikun/db';
import { account } from '@seller-kanrikun/db/schema';
import { eq } from 'drizzle-orm';
import type { CatalogItemsResponse } from '~/types';

export async function getCatalogData(db: ClientType) {
	const itemList = [];

	const accounts = await db
		.select()
		.from(account)
		.where(eq(account.providerId, 'seller-central'))
		.all();

	const eachAccount = accounts[0];

	const response = await fetch(
		'https://sellingpartnerapi-fe.amazon.com/catalog/2022-04-01/items?identifiersType=ASIN&identifiers=B06ZXXQGZ8&marketplaceIds=A1VC38T7YXB528',
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': eachAccount.accessToken!,
			},
		},
	);

	const responseData: CatalogItemsResponse = await response.json();

	console.log(responseData);
	console.log(responseData.items[0]);
	console.log(responseData.items[0].summaries);
	console.log(responseData.items[0].summaries[0].browseClassification);

	return responseData;
}
