import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import type { paths as inventoryPaths } from '@seller-kanrikun/sp-api/schema/fba-inventory';
import type { paths as reportsPaths } from '@seller-kanrikun/sp-api/schema/reports';
import { Hono } from 'hono';
import createApiClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import Papa from 'papaparse';

import { tsvObjToTsvGzip } from '@seller-kanrikun/data-operation/tsv-gzip';

import {
	FILE_NAMES,
	JAPAN_MARKET_PLACE_ID,
	SELLER_API_BASE_URL,
} from '~/lib/constants';
import { putFile } from '~/lib/r2';

import { InventorySummary } from '@seller-kanrikun/data-operation/types/inventory';
import {
	accessTokenMiddleware,
	authMiddleware,
	dbMiddleware,
} from './middleware';

const baseUrl = 'https://sellingpartnerapi-fe.amazon.com';

export const app = new Hono()
	.use(authMiddleware)
	.get('/', accessTokenMiddleware, async c => {
		const accessToken = c.var.spApiAccessToken;

		// レポートapi
		const reportsApi = createApiClient<reportsPaths>({
			baseUrl: SELLER_API_BASE_URL,
		});

		const tokenMiddleware: Middleware = {
			async onRequest({ request, options }) {
				// リクエストにアクセストークンを追加
				request.headers.set('x-amz-access-token', accessToken);
				return request;
			},
		};
		reportsApi.use(tokenMiddleware);

		// レポートの一覧を取得
		let reportsResponse = await reportsApi.GET(
			'/reports/2021-06-30/reports',
			{
				params: {
					query: {
						reportTypes: [
							'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
						],
						pageSize: 100, // 最大
					},
				},
			},
		);

		if (reportsResponse.data !== undefined) {
			const reportsData = [reportsResponse.data];
			// nextTokenがあるかぎり続けて取得
			while (reportsResponse.data.nextToken) {
				const nextToken: string = reportsResponse.data.nextToken;
				reportsResponse = await reportsApi.GET(
					'/reports/2021-06-30/reports',
					{
						params: {
							query: {
								nextToken, // nextTokenのときはnextTokenのみでよい
							},
						},
					},
				);

				// レスポンスがある場合は追加
				if (reportsResponse.data) {
					reportsData.push(reportsResponse.data);
				} else {
					// レスポンスがない場合は終了
					break;
				}
			}

			// レポートドキュメント保存用のデータ
			const documentRows: Record<string, string>[] = [];

			// レポートドキュメントの取得
			const documentsPromises = reportsData.map(({ reports }) =>
				reports.map(async report => {
					if (!report.reportDocumentId) throw new Error();

					// レポートドキュメントの取得
					const reportDocumentResponse = await reportsApi.GET(
						'/reports/2021-06-30/documents/{reportDocumentId}',
						{
							params: {
								path: {
									reportDocumentId: report.reportDocumentId,
								},
							},
						},
					);
					// データがない場合は終了
					if (!reportDocumentResponse.data) return;

					// レポートドキュメントのデータ取得
					const documentDataResponse = await fetch(
						reportDocumentResponse.data.url,
					);
					// レポートドキュメントのストリームを取得
					const webReadableStream =
						documentDataResponse.body as unknown as WebReadableStream<Uint8Array>;
					const nodeStream = Readable.fromWeb(webReadableStream);

					// パース用のPapaparseストリームを作成
					const papaStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
						header: true, // CSVヘッダーの有無
						delimiter: '\t', // 必要に応じて区切り文字を設定
					});

					// パース時のイベントハンドラ
					papaStream.on('data', (row: Record<string, string>) => {
						documentRows.push(row);
					});

					// パース終了時
					const endPromise = new Promise<void>((resolve, reject) => {
						// パース完了時
						papaStream.on('end', () => {
							console.log('Parsing complete.');
							console.log('New rows:', documentRows.length);

							resolve();
						});
						// エラーハンドリング
						papaStream.on('error', error => {
							console.error('Error parsing CSV:', error);
							reject(error);
						});
					});

					// ストリームにパイプしてパース開始
					nodeStream.pipe(papaStream);

					return endPromise;
				}),
			);

			await Promise.all(documentsPromises);

			console.log('All parsing complete.', documentRows);

			const gzippedReports = tsvObjToTsvGzip(documentRows);
			const userId = c.var.user.id;
			putFile(userId, FILE_NAMES.SETTLEMENT_REPORT, gzippedReports);
		}

		// 以下inventoryの処理
		const inventoryApi = createApiClient<inventoryPaths>({
			baseUrl: SELLER_API_BASE_URL,
		});

		inventoryApi.use(tokenMiddleware);

		const inventoryQueries = {
			granularityType: 'Marketplace' as const,
			granularityId: JAPAN_MARKET_PLACE_ID,
			marketplaceIds: [JAPAN_MARKET_PLACE_ID],
		};

		// 一覧の取得
		let inventoryResponse = await inventoryApi.GET(
			'/fba/inventory/v1/summaries',
			{
				params: {
					query: {
						...inventoryQueries,
					},
				},
			},
		);

		const summaries: object[] = [];
		const summariesRows: Record<string, string>[] = [];
		if (inventoryResponse.data !== undefined) {
			// 今のデータを保存
			const inventorySummaries =
				inventoryResponse?.data?.payload?.inventorySummaries;
			if (inventorySummaries) {
				summaries.push(inventorySummaries);
			}
			// nextTokenがあるかぎり続けて取得
			while (
				inventoryResponse?.data?.pagination?.nextToken !== undefined
			) {
				const nextToken: string =
					inventoryResponse.data.pagination.nextToken;
				inventoryResponse = await inventoryApi.GET(
					'/fba/inventory/v1/summaries',
					{
						params: {
							query: {
								...inventoryQueries,
								nextToken: nextToken,
							},
						},
					},
				);

				// レスポンスがある場合は追加
				const inventorySummaries =
					inventoryResponse?.data?.payload?.inventorySummaries;
				if (inventorySummaries) {
					summaries.push(inventorySummaries);
				}
			}

			// 取得したデータをまとめる
			for (const inventorySummary of summaries) {
				for (const [key, value] of Object.entries(inventorySummary)) {
					if (value === null) continue;
					summariesRows.push({ [key]: value as string });
				}
			}

			// tsvGzipに変換して保存
			const gzipped = await tsvObjToTsvGzip(summariesRows);
			const userId = c.var.user.id;
			putFile(userId, FILE_NAMES.INVENTORY_SUMMARIES, gzipped);
		}
	});
