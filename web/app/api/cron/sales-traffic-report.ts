import type { Readable } from 'node:stream';
import { addDays } from 'date-fns';
import { gunzipSync, gzipSync } from 'fflate';
import type { Middleware } from 'openapi-fetch';
import createApiClient from 'openapi-fetch';
import Papa from 'papaparse';

import { R2, getFile, putFile } from '@seller-kanrikun/data-operation/r2';
import {
	tsvGzipToTsvObj,
	tsvGzipToTsvStr,
	tsvObjToTsvGzip,
} from '@seller-kanrikun/data-operation/tsv-gzip';
import { createClient as createDBClient } from '@seller-kanrikun/db';
import {
	getAccountsByProviderId,
	refreshAccessToken,
} from '@seller-kanrikun/db/account';
import { user } from '@seller-kanrikun/db/schema';
import type { paths } from '@seller-kanrikun/sp-api/schema/reports';

import {
	FILE_NAMES,
	JAPAN_MARKET_PLACE_ID,
	R2_BUCKET_NAME,
} from '~/lib/constants';

type salesTrafficReportMeta = {
	start: Date;
	end: Date;
	sellerKanrikunSaveTime: Date;
	reportId: string;
};

export async function GET(request: Request) {
	// DBクライアントを作成
	const db = createDBClient({
		url: process.env.TURSO_CONNECTION_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	});

	// セラーセントラルのアカウントを全取得
	const accounts = await getAccountsByProviderId(db, 'seller-central');

	// アカウントごとにループ
	for (let account of accounts) {
		// アクセストークンを追加するミドルウェアを作成

		const api = createApiClient<paths>({
			baseUrl: 'https://sellingpartnerapi-fe.amazon.com',
		});

		const tokenMiddleware: Middleware = {
			async onRequest({ request, options }) {
				// アクセストークンを更新
				account = await refreshAccessToken(
					db,
					'https://api.amazon.com/auth/o2/token',
					account,
					process.env.SP_API_CLIENT_ID!,
					process.env.SP_API_CLIENT_SECRET!,
				);

				// アクセストークンが取得できなかった場合はエラーを返す
				if (account.accessToken === undefined) {
					console.error('accessToken is undefined');
					return request;
				}

				// リクエストにアクセストークンを追加
				request.headers.set('x-amz-access-token', account.accessToken!);
				return request;
			},
		};
		api.use(tokenMiddleware);

		const existMetaDataResponse = await getFile(
			R2_BUCKET_NAME,
			account.id,
			FILE_NAMES.SALES_TRAFFIC,
		);
		if (existMetaDataResponse === undefined) {
			console.log('existMetaDataResponse is undefined');
			continue;
		}

		const stream = existMetaDataResponse.Body as Readable;

		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);
		const existData = tsvGzipToTsvObj(buffer);

		console.log('existData:', existData);

		let currentDate = new Date('2024-01-01T00:00:00Z');
		// 終了日を2日前に設定
		const endDate = addDays(new Date(), -2);

		const result: Record<string, string>[] = [];
		const columns: Set<string> = new Set([
			'asin',
			'startDate',
			'endDate',
			'sellerKanrikunSaveTime',
		]);

		while (currentDate < endDate) {
			// 次の日
			const nextDate = addDays(currentDate, 1);
			const createReportParams = {
				reportType: 'GET_SALES_AND_TRAFFIC_REPORT',
				marketplaceIds: [JAPAN_MARKET_PLACE_ID],
				reportOptions: {
					asinGranularity: 'CHILD',
				},
				dataStartTime: currentDate.toISOString(),
				dataEndTime: nextDate.toISOString(),
			};

			const promises = [];

			const createReportResponse = await fetchWithRetryRateLimit(() => {
				return api.POST('/reports/2021-06-30/reports', {
					body: createReportParams,
				});
			}, [60, 5, 60]);

			console.log('createReportResponse:', createReportResponse);

			if (createReportResponse.data !== undefined) {
				const reportId: string = createReportResponse.data.reportId;
				const reportResponse = await fetchWithRetryStatusDone(() => {
					return fetchWithRetryRateLimit(() => {
						return api.GET(
							'/reports/2021-06-30/reports/{reportId}',
							{
								params: {
									path: {
										reportId: reportId,
									},
								},
							},
						);
					}, [60, 5, 60]);
				});

				if (
					reportResponse.data !== undefined &&
					reportResponse.data.processingStatus === 'DONE'
				) {
					const reportDocumentId =
						reportResponse.data.reportDocumentId;
					if (reportDocumentId === undefined) {
						console.error(
							'reportDocumentId is undefined',
							reportResponse,
						);
						continue;
					}
					const reportDocument = await fetchWithRetryRateLimit(() => {
						return api.GET(
							'/reports/2021-06-30/documents/{reportDocumentId}',
							{
								params: {
									path: {
										reportDocumentId: reportDocumentId,
									},
								},
							},
						);
					});
					logFetchReturn(reportDocument, 'fetch reportDocument');

					if (reportDocument.data === undefined) {
						console.error('reportDocument.data is undefined');
						continue;
					}

					// レポートドキュメントの取得
					const reportDocumentResponse = await fetch(
						reportDocument.data.url,
						{
							method: 'GET',
						},
					);
					if (
						reportDocument.data.compressionAlgorithm &&
						reportDocument.data.compressionAlgorithm === 'GZIP'
					) {
						const gzipData =
							await reportDocumentResponse.arrayBuffer();
						console.log('gzipData:', gzipData);
						const decompressed = gunzipSync(
							new Uint8Array(gzipData),
						);
						const decoder = new TextDecoder();
						const jsonStr = decoder.decode(decompressed);
						const trimStr = jsonStr.trim();
						const json = JSON.parse(trimStr);

						try {
							const salesAndTrafficByAsin =
								json.salesAndTrafficByAsin;
							for (const eachData of salesAndTrafficByAsin) {
								const asin = eachData.parentAsin;
								const salesData = eachData.salesByAsin;
								const salesAmount = salesData.salesAmount;
								const trafficData = eachData.trafficByAsin;

								const newData: Record<string, string> = {
									asin: asin,
									startDate: currentDate.toISOString(),
									endDate: nextDate.toISOString(),
									sellerKanrikunSaveTime:
										new Date().toISOString(),
									salesAmount: '',
								};

								for (const [key, value] of Object.entries(
									salesData,
								)) {
									newData[key] = value as string;
									columns.add(key);
									if (
										typeof value === 'object' &&
										value &&
										'amount' in value
									) {
										const amountKey = `${key}Amount`;
										newData[amountKey] =
											value.amount as string;

										columns.add(amountKey);
									}
								}
								for (const [key, value] of Object.entries(
									trafficData,
								)) {
									newData[key] = value as string;
									columns.add(key);
									if (
										typeof value === 'object' &&
										value &&
										'amount' in value
									) {
										const amountKey = `${key}Amount`;
										newData[amountKey] =
											value.amount as string;
										columns.add(amountKey);
									}
								}

								console.log('newData:', newData);

								result.push(newData);
							}
						} catch (error) {
							console.error('Error:', error);
						}
					} else {
						console.error(
							'reportDocument.data.compressionAlgorithm is not GZIP',
						);
					}
				}
			}

			await waitRateLimitTime(createReportResponse.response, 60);
			currentDate = nextDate;
		}

		const finalColumns = Array.from(columns);

		const allColData = result.map(row => {
			const newRow: Record<string, string> = {};
			for (const col of finalColumns) {
				newRow[col] = row[col] ?? '';
			}
			return newRow;
		});

		console.log('allColData:', allColData);

		const resultTsv = tsvObjToTsvGzip(allColData);

		const putResponse = await putFile(
			R2_BUCKET_NAME,
			account.userId,
			FILE_NAMES.SALES_TRAFFIC,
			resultTsv,
		);

		console.log('putResponse:', putResponse);
	}

	return new Response('henohenomoheji', {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}

async function waitRateLimitTime(response: Response, defaultTime: number) {
	const limitStr = response.headers.get('x-amzn-ratelimit-limit');
	console.log('limitStr:', limitStr);
	const waitTime =
		limitStr !== null && !Number.isNaN(Number(limitStr))
			? 1 / Number(limitStr)
			: defaultTime;
	console.log('waitTime:', waitTime);
	await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
}
/*
async function retryFetch<T>(fetch: () => Promise<T>): Promise<T> {
	return fetch();
}*/

interface fetchReturn<Data, Error> {
	response: Response;
	data?: Data;
	error?: Error;
}

async function fetchWithRetryStatusDone<
	Data extends {
		processingStatus:
			| 'CANCELLED'
			| 'DONE'
			| 'FATAL'
			| 'IN_PROGRESS'
			| 'IN_QUEUE';
	},
	Error,
>(
	func: () => Promise<fetchReturn<Data, Error>>,
	waitTime = 30,
): Promise<fetchReturn<Data, Error>> {
	const result = await func();
	logFetchReturn(result, 'fetch with retryStatusDone');
	if (result.error) {
		return result;
	}
	if (
		result.data &&
		(result.data.processingStatus === 'DONE' ||
			result.data.processingStatus === 'CANCELLED')
	) {
		return result;
	}
	if (
		result.data &&
		(result.data.processingStatus === 'IN_PROGRESS' ||
			result.data.processingStatus === 'IN_QUEUE')
	) {
		await waitRateLimitTime(result.response, waitTime);
		return await fetchWithRetryStatusDone(func);
	}
	console.error('processingStatus is not DONE:', result.data);
	return { response: result.response };
}

async function fetchWithRetryNextToken<
	Data extends { nextToken?: string },
	Error,
>(
	func: (nextToken: string | null) => Promise<fetchReturn<Data, Error>>,
	waitTime = 0.5,
): Promise<fetchReturn<Data, Error>[]> {
	const results = [];

	let nextToken: string | null = null;
	// 一応無限ループ対策、1000回で打ち切る
	const maxCount = 1000;
	for (let i = 0; i < maxCount; i++) {
		// 関数を実行、結果を保存
		const result = await func(nextToken);
		logFetchReturn(result, 'fetch with retryNextToken');
		results.push(result);

		// エラーがある場合はループを抜ける
		if (result.error) break;
		// nextTokenがない場合はループを抜ける
		if (result.data?.nextToken === undefined) break;
		// nextTokenを更新
		nextToken = result.data?.nextToken;
		// レート制限分待機
		await waitRateLimitTime(result.response, waitTime);
	}
	// 1000回で打ち切った場合はエラーを出力
	if (results.length === maxCount) {
		console.error('retryFetch: retry limit exceeded');
	}
	return results;
}

// レート制限のリトライ付きfetchを実行
async function fetchWithRetryRateLimit<Data, Error>(
	func: () => Promise<fetchReturn<Data, Error>>,
	waitTimes: number[] = [30, 5, 30],
	count = 0,
): Promise<fetchReturn<Data, Error>> {
	const result = await func();
	// エラーがレートリミットの場合
	if (result.response.status === 429) {
		// リトライ回数が最後の場合はそのまま返す
		if (count >= waitTimes.length) {
			return result;
		}
		// エラーをログ
		logFetchReturn(result, 'fetch with retryRateLimit');
		// 待機
		const retryTime = waitTimes[count];
		await waitRateLimitTime(result.response, retryTime);
		// リトライ
		return await fetchWithRetryRateLimit(func, waitTimes, count + 1);
	}
	return result;
}

function logFetchReturn<Data, Error>(
	response: fetchReturn<Data, Error>,
	fetchName: string,
) {
	if (response.error) {
		console.error(`Failed to ${fetchName}`, response.error);
	} else if (response.data) {
		console.log(`Data ${fetchName}:`, response.data);
	} else {
		console.error(`No error and data on ${fetchName}:`, response.response);
	}
}
