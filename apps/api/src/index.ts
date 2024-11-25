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
import { gzipSync } from 'fflate';
import { z } from 'zod';

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
			const json = csvToJson(document);
			const jsonString = JSON.stringify(json);
			const compressed = gzipSync(new TextEncoder().encode(jsonString));
			console.log(json);

			await env.MY_BUCKET.put('key', compressed, {
				httpMetadata: {
					contentType: 'application/json',
					contentEncoding: 'gzip',
				},
			});
		}

		console.log(accounts);
	},
} satisfies ExportedHandler<Env>;
const ReportDocumentSchema = z.object({
	'settlement-id': z.string().default(''),
	'settlement-start-date': z
		.string()
		.optional()
		.transform(val => (val ? new Date(val) : '')),
	'settlement-end-date': z
		.string()
		.optional()
		.transform(val => (val ? new Date(val) : '')),
	'deposit-date': z
		.string()
		.optional()
		.transform(val => (val ? new Date(val) : '')),
	'total-amount': z.string().default(''),
	currency: z.string().default(''),
	'transaction-type': z.string().default(''),
	'order-id': z.string().default(''),
	'merchant-order-id': z.string().default(''),
	'adjustment-id': z.string().default(''),
	'shipment-id': z.string().default(''),
	'marketplace-name': z.string().default(''),
	'shipment-fee-type': z.string().default(''),
	'shipment-fee-amount': z.string().default(''),
	'order-fee-type': z.string().default(''),
	'order-fee-amount': z.string().default(''),
	'fulfillment-id': z.string().default(''),
	'posted-date': z
		.string()
		.optional()
		.transform(val => (val ? new Date(val) : '')),
	'order-item-code': z.string().default(''),
	'merchant-order-item-id': z.string().default(''),
	'merchant-adjustment-item-id': z.string().default(''),
	sku: z.string().default(''),
	'quantity-purchased': z.string().default(''),
	'price-type': z.string().default(''),
	'price-amount': z.string().default(''),
	'item-related-fee-type': z.string().default(''),
	'item-related-fee-amount': z
		.string()
		.optional()
		.transform(val => {
			if (val) {
				const num = Number.parseFloat(val);
				return Number.isNaN(num) ? '' : num;
			}
			return '';
		}),
	'misc-fee-amount': z.string().default(''),
	'other-fee-amount': z.string().default(''),
	'other-fee-reason-description': z.string().default(''),
	'promotion-id': z.string().default(''),
	'promotion-type': z.string().default(''),
	'promotion-amount': z.string().default(''),
	'direct-payment-type': z.string().default(''),
	'direct-payment-amount': z.string().default(''),
	'other-amount': z.string().default(''),
});

type ReportDocumentJson = z.infer<typeof ReportDocumentSchema>;

const csvToJson = (csv: string): ReportDocumentJson[] => {
	// 改行で分割
	const lines = csv.split('\n');
	const headers = lines[0].split('\t');

	// ヘッダーをキーにしてオブジェクトに変換
	return lines.slice(1).map(line => {
		// タブで分割
		const values = line.split('\t');
		const row: Record<string, string> = {};

		// ヘッダーと値をセット
		headers.forEach((header, index) => {
			row[header] = values[index] || '';
		});

		// zodでパース
		return ReportDocumentSchema.parse(row);
	});
};
