import type { Middleware } from 'openapi-fetch';

import { createClient } from '@seller-kanrikun/db';
import {
	getAccountsByProviderId,
	refreshAccountsToken,
} from '@seller-kanrikun/db/account';
import { reportsClient } from '@seller-kanrikun/sp-api/client/reports';

const japanMarketPlaceId = 'A1VC38T7YXB528';

export async function GET(request: Request) {
	const db = createClient({
		url: process.env.TURSO_CONNECTION_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	});

	let accounts = await getAccountsByProviderId(db, 'seller-central');

	accounts = await refreshAccountsToken(
		db,
		accounts,
		process.env.AMAZON_CLIENT_ID!,
		process.env.AMAZON_CLIENT_SECRET!,
		process.env.SP_API_CLIENT_ID!,
		process.env.SP_API_CLIENT_SECRET!,
	);

	for (const account of accounts) {
		if (account.accessToken === null) {
			console.error('accessToken is undefined');
			continue;
		}
		const middleware: Middleware = {
			async onRequest({ request, options }) {
				request.headers.set('x-amz-access-token', account.accessToken!);
				return request;
			},
		};
		reportsClient.use(middleware);
		const reports = await reportsClient.GET('/reports/2021-06-30/reports', {
			params: {
				query: {
					reportTypes: ['GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE'],
				},
			},
		});

		console.log(reports);

		reportsClient.eject(middleware);
	}

	return new Response('henohenomoheji', {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}
