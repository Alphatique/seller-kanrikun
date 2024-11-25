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
	generateR2Hash,
	getAccountsByProviderId,
	getReportDocument,
	getSettlementReports,
	reportDocumentTextToJson,
	updateAccessToken,
} from '@seller-kanrikun/data-operation';
import type { SettlementReportsResponse } from '@seller-kanrikun/data-operation/types';
import { createClient } from '@seller-kanrikun/db';
import { gzipSync } from 'fflate';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		switch (request.method) {
			case 'PUT': {
				await env.MY_BUCKET.put(key, request.body);
				return new Response(`Put ${key} successfully!`);
			}
			case 'GET': {
				const object = await env.MY_BUCKET.get(key);

				if (object === null) {
					return new Response('Object Not Found', { status: 404 });
				}

				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);

				return new Response(object.body, {
					headers,
				});
			}
			case 'DELETE': {
				await env.MY_BUCKET.delete(key);
				return new Response('Deleted!');
			}
			default: {
				return new Response('Method Not Allowed', {
					status: 405,
					headers: {
						Allow: 'PUT, GET, DELETE',
					},
				});
			}
		}
	},
	async scheduled(event, env, ctx): Promise<void> {
		// dbの接続
		const db = await createClient({
			url: env.TURSO_CONNECTION_URL,
			authToken: env.TURSO_AUTH_TOKEN,
		});

		// セラーのアカウントの全取得
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		for (const account of accounts) {
			// アクセストークンの更新
			await updateAccessToken(
				db,
				account,
				env.SP_API_CLIENT_ID,
				env.SP_API_CLIENT_SECRET,
			);
			// レポート一覧の取得
			const reports: SettlementReportsResponse = await getSettlementReports(
				account.accessToken!,
			);
			// レポートドキュメントの取得
			const document: string = await getReportDocument(
				reports.reports[0].reportDocumentId,
				account.accessToken!,
			);
			const json = reportDocumentTextToJson(document);
			const jsonString = JSON.stringify(json);
			const compressed = gzipSync(new TextEncoder().encode(jsonString));
			console.log(json);

			const hashKey = await generateR2Hash(account.userId, 'report.gzip');

			await env.MY_BUCKET.put(hashKey, compressed, {
				httpMetadata: {
					contentType: 'application/json',
					contentEncoding: 'gzip',
				},
			});
		}

		console.log(accounts);
	},
} satisfies ExportedHandler<Env>;
