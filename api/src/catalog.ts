import { account } from '@seller-kanrikun/db';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { CatalogItemsResponse, CustomVariables } from '~/types';
import { updateAccessToken } from './account';

const app = new Hono<{
	Bindings: CloudflareBindings;
	Variables: CustomVariables;
}>();

app.get('/', async c => {
	const itemList = [];

	const db = c.get('DB');

	const accounts = await db
		.select()
		.from(account)
		.where(eq(account.providerId, 'seller-central'))
		.all();

	const eachAccount = accounts[0];

	await updateAccessToken(
		db,
		eachAccount,
		c.env.SP_API_CLIENT_ID,
		c.env.SP_API_CLIENT_SECRET,
	);

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

	return new Response('ok');
});

export default app;
