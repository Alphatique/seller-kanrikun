import { account, createDbClient } from '@seller-kanrikun/db';
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import { Hono } from 'hono';
const app = new Hono();
let dbClient = null;
function initDb(env) {
	if (!dbClient) {
		dbClient = createDbClient(env.TURSO_CONNECTION_URL, env.TURSO_AUTH_TOKEN);
	}
	return dbClient.db;
}
app.get('/reports/all', async c => {
	const db = initDb(c.env);
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
					'x-amz-access-token': eachAccount.accessToken,
				},
			},
		);
		const reportsData = await reports.json();
		const reportData = reportsData.reports[0];
		const reportDocument = await fetch(
			`https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/documents/${reportData.reportDocumentId}`,
			{
				method: 'GET',
				headers: {
					'x-amz-access-token': eachAccount.accessToken,
				},
			},
		);
		const reportDocumentData = await reportDocument.json();
		const reportDocumentText = await fetch(reportDocumentData.url, {
			method: 'GET',
		});
		const reportDocumentTextData = await reportDocumentText.text();
		console.log(reportDocumentTextData);
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
async function getReportsByNextToken(nextToken, accessToken) {
	const reponse = await fetch(
		`https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/reports?nextToken=${encodeURIComponent(nextToken)}`,
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);
	const responseData = await reponse.json();
	return responseData;
}
app.get('/account/refresh_tokens', async c => {
	const db = initDb(c.env);
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
		switch (eachAccount.providerId) {
			case 'amazon':
				updateAccessToken(
					c.env,
					eachAccount,
					c.env.AMAZON_CLIENT_ID,
					c.env.AMAZON_CLIENT_SECRET,
				);
				break;
			case 'seller-central':
				updateAccessToken(
					c.env,
					eachAccount,
					c.env.SP_API_CLIENT_ID,
					c.env.SP_API_CLIENT_SECRET,
				);
				break;
		}
	}
});
async function updateAccessToken(env, accountData, clientId, clientSecret) {
	if (
		accountData.expiresAt &&
		accountData.expiresAt.getTime() < Date.now() &&
		accountData.refreshToken
	) {
		const db = initDb(env);
		const getAccessToken = await fetch(
			'https://api.amazon.co.jp/auth/o2/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: accountData.refreshToken, // TODO: check if refreshToken is null
					client_id: clientId,
					client_secret: clientSecret,
				}),
			},
		);
		const accessTokenJson = await getAccessToken.json();
		const expiresAt = new Date(Date.now() + accessTokenJson.expires_in * 1000);
		console.log(accessTokenJson, accountData);
		db.update(account)
			.set({ accessToken: accessTokenJson.access_token, expiresAt: expiresAt })
			.where(
				and(
					eq(account.id, accountData.id),
					eq(account.providerId, accountData.providerId),
				),
			)
			.run();
	}
}
export default app;
