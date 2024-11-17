/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
	getAccountsByProviderId,
	getReportDocument,
	getSettlementReports,
	updateAccessToken,
} from '@seller-kanrikun/data-operation';
import type { SettlementReportsResponse } from '@seller-kanrikun/data-operation/types';
import { createClient } from '@seller-kanrikun/db';

import { parquet } from '@seller-kanrikun/data-operation';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response('Hello World!');
	},
	async scheduled(event, env, ctx): Promise<void> {
		const db = await createClient({
			url: env.TURSO_CONNECTION_URL,
			authToken: env.TURSO_AUTH_TOKEN,
		});
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		for (const account of accounts) {
			await updateAccessToken(
				db,
				account,
				env.SP_API_CLIENT_ID,
				env.SP_API_CLIENT_SECRET,
			);
			const reports: SettlementReportsResponse = await getSettlementReports(
				account.accessToken!,
			);
			const document: string = await getReportDocument(
				reports.reports[0].reportDocumentId,
				account.accessToken!,
			);
			//console.log(document);
			await parquet(document);
		}

		console.log(accounts);
	},
} satisfies ExportedHandler<Env>;
