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
	GzipToJson,
	JsonToGzip,
	generateR2Hash,
	removeEmpty,
	reportDocumentTextToJson,
} from '@seller-kanrikun/calc';

import {
	getReportDocument,
	getSettlementReports,
} from '@seller-kanrikun/api-fetch';
import {
	getAccountsByProviderId,
	updateAccessToken,
} from '@seller-kanrikun/db';

import type { SettlementReportType } from '@seller-kanrikun/api-fetch/types';
import type { ReportDocumentRowJson } from '@seller-kanrikun/calc/types';

import { createClient } from '@seller-kanrikun/db';

export default {
	// 通常fetch。オブジェクトストレージにcurlでput, get, deleteできるやつ
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		switch (request.method) {
			case 'PUT': {
				await env.MY_BUCKET.put(key, request.body);
				return new Response(`Put ${key} successfully!`);
			}
			// getはブラウザでも見えるよ
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
	// スケジュールされた関数。/__scheduledにアクセスすると実行される(--test-scheduledオプション)
	async scheduled(event, env, ctx): Promise<void> {
		// dbの接続
		const db = await createClient({
			url: env.TURSO_CONNECTION_URL,
			authToken: env.TURSO_AUTH_TOKEN,
		});

		// セラーのアカウントの全取得
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		for (let account of accounts) {
			// アクセストークンの更新
			account = await updateAccessToken(
				db,
				'https://api.amazon.co.jp/auth/o2/token',
				account,
				env.SP_API_CLIENT_ID,
				env.SP_API_CLIENT_SECRET,
			);
			// レポート一覧の取得
			const reports: SettlementReportType[] = await getSettlementReports(
				account.accessToken!,
			);

			// 一時データ変数
			const reportDocumentsArray: ReportDocumentRowJson[] = [];
			const reportMetaDataArray: SettlementReportType[] = [];
			let updateIndex = 0;

			// ハッシュキーの生成
			const hashKey = await generateR2Hash(account.userId, 'report.gzip');

			console.log(account.userId, hashKey);

			// ハッシュキーの生成
			const metaHashKey = await generateR2Hash(
				account.userId,
				'report-meta.gzip',
			);

			// バケットからデータの取得
			const existData = await env.MY_BUCKET.get(hashKey);
			const existMetaData = await env.MY_BUCKET.get(metaHashKey);
			// 既存のデータが存在する場合
			if (existData !== null && existData.body !== null) {
				// データを復元
				const arrayBuffer = await existData.arrayBuffer();

				const restoredArray: ReportDocumentRowJson[] = GzipToJson(
					new Uint8Array(arrayBuffer),
				);

				// 既存のデータを追加
				reportDocumentsArray.push(...restoredArray);
			}

			if (existMetaData !== null && existMetaData.body !== null) {
				// メタデータを復元
				const metaArrayBuffer = await existMetaData.arrayBuffer();

				const metaDecompressed: SettlementReportType[] = GzipToJson(
					new Uint8Array(metaArrayBuffer),
				);

				// 既存のメタデータを追加
				reportMetaDataArray.push(...metaDecompressed);
			}

			for (const report of reports) {
				// メタデータの重複チェック
				const metaExist = reportMetaDataArray.find(
					meta => meta.reportId === report.reportId,
				);

				if (metaExist) {
					continue;
				}

				// レポートドキュメントの取得
				const document: string = await getReportDocument(
					report.reportDocumentId,
					account.accessToken!,
				);

				if (document === 'error') break;

				// TODO: データの範囲が被ってるときの処理
				updateIndex++;
				if (updateIndex >= 3) continue;
				// メタデータの追加
				reportMetaDataArray.push(report);

				// レポートドキュメントのJSONオブジェクト化
				const json = reportDocumentTextToJson(document);

				reportDocumentsArray.push(...json);
			}

			// 重複と空の行を削除
			const removedArray: ReportDocumentRowJson[] = removeEmpty(
				reportDocumentsArray,
				'settlement-id',
			);

			if (updateIndex === 0) continue;
			const gzipData = JsonToGzip(removedArray);
			const gzipMetaData = JsonToGzip(reportMetaDataArray);

			// バケットに保存
			await env.MY_BUCKET.put(hashKey, gzipData, {
				httpMetadata: {
					contentType: 'application/json',
					contentEncoding: 'gzip',
				},
			});

			await env.MY_BUCKET.put(metaHashKey, gzipMetaData, {
				httpMetadata: {
					contentType: 'application/json',
					contentEncoding: 'gzip',
				},
			});
		}
	},
} satisfies ExportedHandler<Env>;
