import type { createClient } from '@libsql/client';
import type { Account } from '@seller-kanrikun/db';
import { account, createDbClient } from '@seller-kanrikun/db';
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/libsql';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import type {
	AuthTokenResponse,
	InventorySummariesResponse,
	SettlementReportDocumentResponse,
	SettlementReportsResponse,
} from '~/types';

interface CustomVariables {
	DB: ReturnType<typeof drizzle>;
}

const app = new Hono<{
	Bindings: CloudflareBindings;
	Variables: CustomVariables;
}>();

app.use(cors());
app.use('*', async (c, next) => {
	const corsMiddleware = cors({
		origin: c.env.MY_WEB_ORIGIN,
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		credentials: true,
	});

	const dbClient: {
		client: ReturnType<typeof createClient>;
		db: ReturnType<typeof drizzle>;
	} = createDbClient(c.env.TURSO_CONNECTION_URL!, c.env.TURSO_AUTH_TOKEN!);

	c.set('DB', dbClient.db);
	return corsMiddleware(c, next);
});

app.get('/inventory', async c => {
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

app.get('/reports/all', async c => {
	const db = c.get('DB');

	const accounts = await db
		.select()
		.from(account)
		.where(eq(account.providerId, 'seller-central'))
		.all();

	for (const eachAccount of accounts) {
		const reports = await fetch(
			'https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/reports?reportTypes=GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
			{
				method: 'GET',
				headers: {
					'x-amz-access-token': eachAccount.accessToken!,
				},
			},
		);
		const reportsData: SettlementReportsResponse = await reports.json();

		console.log(reportsData);

		const reportData = reportsData.reports[0];

		const reportDocument = await fetch(
			`https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/documents/${reportData.reportDocumentId}`,
			{
				method: 'GET',
				headers: {
					'x-amz-access-token': eachAccount.accessToken!,
				},
			},
		);

		const reportDocumentData: SettlementReportDocumentResponse =
			await reportDocument.json();

		console.log(reportDocumentData);
		const reportDocumentText = await fetch(reportDocumentData.url, {
			method: 'GET',
		});

		const reportDocumentTextData = await reportDocumentText.text();

		/*

		let nextToken = reportsData.nextToken;
		while (nextToken) {
			const nextReports = await getReportsByNextToken(
				nextToken,
				eachAccount.accessToken!,
			);
			nextToken = nextReports.nextToken;

			console.log(nextReports);
		}
*/
	}
});

async function getReportsByNextToken(nextToken: string, accessToken: string) {
	const reponse = await fetch(
		`https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/reports?nextToken=${encodeURIComponent(nextToken)}`,
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);

	const responseData: SettlementReportsResponse = await reponse.json();
	return responseData;
}

app.get('/account/refresh_tokens', async c => {
	const db = c.get('DB');
	const accounts = await db
		.select()
		.from(account)
		.where(
			and(
				isNotNull(account.refreshToken),
				isNotNull(account.expiresAt),
				lt(account.expiresAt, new Date()),
			),
		)
		.all();

	for (const eachAccount of accounts) {
		console.log(eachAccount);
		switch (eachAccount.providerId) {
			case 'amazon':
				await updateAccessToken(
					db,
					eachAccount,
					c.env.AMAZON_CLIENT_ID,
					c.env.AMAZON_CLIENT_SECRET,
				);
				break;
			case 'seller-central':
				await updateAccessToken(
					db,
					eachAccount,
					c.env.SP_API_CLIENT_ID,
					c.env.SP_API_CLIENT_SECRET,
				);
				break;
		}
	}

	return new Response('ok');
});

async function updateAccessToken(
	db: ReturnType<typeof drizzle>,
	accountData: Account,
	clientId: string,
	clientSecret: string,
) {
	if (
		accountData.expiresAt &&
		accountData.expiresAt.getTime() < Date.now() &&
		accountData.refreshToken
	) {
		const getAccessToken = await fetch(
			'https://api.amazon.co.jp/auth/o2/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: accountData.refreshToken!, // TODO: check if refreshToken is null
					client_id: clientId,
					client_secret: clientSecret,
				}),
			},
		);

		const accessTokenJson: AuthTokenResponse = await getAccessToken.json();

		const expiresAt = new Date(Date.now() + accessTokenJson.expires_in * 1000);

		await db
			.update(account)
			.set({ accessToken: accessTokenJson.access_token, expiresAt: expiresAt })
			.where(eq(account.id, accountData.id))
			.run();
	}
}

app.get('/hello', async c => {
	return new Response('Heno, world!');
});

app.get('/catalog', async c => {
	const itemList = [];

	const db = c.get('DB');

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
});

export default app;
