import { account } from '@seller-kanrikun/db/schema';
import { eq } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/libsql';
import { Hono } from 'hono';
import type {
	MyHonoInitializer,
	SettlementReportDocumentResponse,
	SettlementReportsResponse,
} from '~/types';

const app = new Hono<MyHonoInitializer>();

app.get('/all', async c => {
	const db: ReturnType<typeof drizzle> = c.get('DB');
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

		let nextToken = reportsData.nextToken;
		while (nextToken) {
			const nextReports = await getReportsByNextToken(
				nextToken,
				eachAccount.accessToken!,
			);
			nextToken = nextReports.nextToken;

			console.log(nextReports);
		}
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

export default app;
