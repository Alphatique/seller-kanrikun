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
	});
