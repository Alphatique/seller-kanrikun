import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import type { paths } from '@seller-kanrikun/sp-api/schema/reports';
import { Hono } from 'hono';
import createApiClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import Papa from 'papaparse';

import { tsvObjToTsvGzip } from '@seller-kanrikun/data-operation/tsv-gzip';

import { FILE_NAMES } from '~/lib/constants';
import { putFile } from '~/lib/r2';

import {
	accessTokenMiddleware,
	authMiddleware,
	dbMiddleware,
} from './middleware';

export const app = new Hono()
	.use(authMiddleware)
	.get('/', accessTokenMiddleware, async c => {
		const accessToken = c.var.spApiAccessToken;

		const reportsApi = createApiClient<paths>({
			baseUrl: '',
		});

		const tokenMiddleware: Middleware = {
			async onRequest({ request, options }) {
				// リクエストにアクセストークンを追加
				request.headers.set('x-amz-access-token', accessToken);
				return request;
			},
		};

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
			while (reportsResponse.data.nextToken) {
				const nextToken: string = reportsResponse.data.nextToken;
				reportsResponse = await reportsApi.GET(
					'/reports/2021-06-30/reports',
					{
						params: {
							query: {
								nextToken,
							},
						},
					},
				);

				if (reportsResponse.data) {
					reportsData.push(reportsResponse.data);
				} else {
					break;
				}
			}

			const documentRows: Record<string, string>[] = [];

			const documentsPromises: Promise<void>[] = [];
			for (const { reports } of reportsData) {
				for (const report of reports) {
					const getParseDocument = new Promise<void>(
						(resolve, reject) => {
							(async () => {
								// 多分頭悪い
								if (report.reportDocumentId) {
									const reportDocumentResponse =
										await reportsApi.GET(
											'/reports/2021-06-30/documents/{reportDocumentId}',
											{
												params: {
													path: {
														reportDocumentId:
															report.reportDocumentId,
													},
												},
											},
										);

									if (reportDocumentResponse.data) {
										const documentDataResponse =
											await fetch(
												reportDocumentResponse.data.url,
											);
										// レポートドキュメントのストリームを取得
										const webReadableStream =
											documentDataResponse.body as unknown as WebReadableStream<Uint8Array>;
										const nodeStream =
											Readable.fromWeb(webReadableStream);

										// パース用のPapaparseストリームを作成
										const papaStream = Papa.parse(
											Papa.NODE_STREAM_INPUT,
											{
												header: true, // CSVヘッダーの有無
												delimiter: '\t', // 必要に応じて区切り文字を設定
											},
										);

										// パース時のイベントハンドラ
										papaStream.on(
											'data',
											(row: Record<string, string>) => {
												documentRows.push(row);
											},
										);

										// パース完了時
										papaStream.on('end', () => {
											console.log('Parsing complete.');
											console.log(
												'New rows:',
												documentRows.length,
											);

											resolve();
										});

										// エラーハンドリング
										papaStream.on('error', error => {
											console.error(
												'Error parsing CSV:',
												error,
											);
											reject();
										});

										// ストリームにパイプしてパース開始
										nodeStream.pipe(papaStream);
									}
								}
								reject();
							})();
						},
					);
					documentsPromises.push(getParseDocument);
				}
			}

			await Promise.all(documentsPromises);

			const gzippedReports = tsvObjToTsvGzip(documentRows);
			const userId = c.var.user.id;
			putFile(userId, FILE_NAMES.SETTLEMENT_REPORT, gzippedReports);
		}
	});
