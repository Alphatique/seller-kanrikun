import type { Readable } from 'node:stream';
import { fetchServerResponse } from 'next/dist/client/components/router-reducer/fetch-server-response';
import type { Middleware } from 'openapi-fetch';
import createApiClient from 'openapi-fetch';

import { getFile, putFile } from '@seller-kanrikun/data-operation/r2';
import {
	tsvGzipToTsvObj,
	tsvObjToTsvGzip,
} from '@seller-kanrikun/data-operation/tsv-gzip';
import type { InventorySummary } from '@seller-kanrikun/data-operation/types/inventory';
import { createClient as createDBClient } from '@seller-kanrikun/db';
import {
	getAccountsByProviderId,
	refreshAccessToken,
} from '@seller-kanrikun/db/account';
import type { paths } from '@seller-kanrikun/sp-api/schema/catalog-items';

import {
	FILE_NAMES,
	JAPAN_MARKET_PLACE_ID,
	R2_BUCKET_NAME,
} from '~/lib/constants';

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
		const api = createApiClient<paths>({
			baseUrl: 'https://sellingpartnerapi-fe.amazon.com',
		});

		// アクセストークンを追加するミドルウェアを作成
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

		const inventoryDataResponse = await getFile(
			R2_BUCKET_NAME,
			account.userId,
			FILE_NAMES.INVENTORY_SUMMARIES,
		);
		if (inventoryDataResponse === undefined) {
			console.log('existMetaDataResponse is undefined');
			continue;
		}

		const stream = inventoryDataResponse.Body as Readable;

		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);
		const inventoryData = tsvGzipToTsvObj<InventorySummary>(buffer);
		if (!inventoryData.data) {
			console.error('inventoryData.data is undefined');
			continue;
		}

		const result: Record<string, string>[] = [];
		const saveTime = new Date();
		for (const inventory of inventoryData.data) {
			const asin = inventory.asin;
			if (!asin) {
				console.error('asin is undefined');
				continue;
			}

			const params = {
				path: {
					asin: asin,
				},
				query: {
					marketplaceIds: [JAPAN_MARKET_PLACE_ID],
				},
			};
			// レポートの一覧を取得
			const catalogItems = await fetchWithRetryRateLimit(() => {
				return api.GET('/catalog/2022-04-01/items/{asin}', {
					params,
				});
			}, [2, 2, 2]);
			logFetchReturn(catalogItems, 'catalogItems');

			const summaries = catalogItems.data?.summaries;
			if (!summaries) {
				console.error('summaries is undefined');
				continue;
			}
			if (!asin) {
				console.error('asin is undefined');
				continue;
			}

			for (const summary of summaries) {
				const summaryRecord: Record<string, string> = {
					sellerKanrikunSaveTime: saveTime.toISOString(),
					asin: asin,
				};
				for (const [key, value] of Object.entries(summary)) {
					summaryRecord[key] = String(value);
				}

				result.push(summaryRecord);
			}
		}

		console.log('result:', result);

		const tsvGzip = await tsvObjToTsvGzip(result);

		const putResponse = await putFile(
			R2_BUCKET_NAME,
			account.userId,
			FILE_NAMES.CATALOG_ITEMS,
			tsvGzip,
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
	waitTimes: number[] = [0.5, 0.5, 0.5],
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
