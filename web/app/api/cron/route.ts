import type { Middleware } from 'openapi-fetch';
import createApiClient from 'openapi-fetch';

import { tsvObjToTsvGzip } from '@seller-kanrikun/data-operation/tsv-gzip';
import type { InventorySummary } from '@seller-kanrikun/data-operation/types/inventory';
import { createClient as createDBClient } from '@seller-kanrikun/db';
import {
	getAccountsByProviderId,
	refreshAccessToken,
} from '@seller-kanrikun/db/account';
import type { paths } from '@seller-kanrikun/sp-api/schema/fba-inventory';
import { getWriteOnlySignedUrl } from '../r2';

const japanMarketPlaceId = 'A1VC38T7YXB528';

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

		// レポートの一覧を取得
		const inventorySummaries = await fetchWithRetryRateLimit(() => {
			// ネクストトークン次第でパラメータを変更
			const params = {
				query: {
					granularityType: 'Marketplace' as const,
					granularityId: japanMarketPlaceId,
					marketplaceIds: [japanMarketPlaceId],
				},
			};
			// リトライ付きfetchを実行
			return fetchWithRetryRateLimit(
				() =>
					api.GET('/fba/inventory/v1/summaries', {
						params,
					}),
				[2, 2, 2],
			);
		});

		console.log('inventorySummaries:', inventorySummaries);
		console.log('inventorySummaries.data:', inventorySummaries.data);

		logFetchReturn(inventorySummaries, 'get inventory summaries');

		const summaries = inventorySummaries?.data?.payload?.inventorySummaries;
		if (!summaries) {
			console.log('no payload:', inventorySummaries.response);
			continue;
		}

		const putSummaries: InventorySummary[] = [];
		const saveTime = new Date();
		for (const inventorySummary of summaries) {
			const summary: InventorySummary = {
				asin: inventorySummary.asin ?? null,
				function: inventorySummary.fnSku ?? null,
				sellerSku: inventorySummary.sellerSku ?? null,
				condition: inventorySummary.condition ?? null,
				inventoryDetails: inventorySummary.inventoryDetails
					? JSON.stringify(inventorySummary.inventoryDetails)
					: null,
				lastUpdatedTime: inventorySummary.lastUpdatedTime
					? new Date(inventorySummary.lastUpdatedTime)
					: null,
				productName: inventorySummary.productName ?? null,
				totalQuantity: inventorySummary.totalQuantity ?? null,
				stores: inventorySummary.stores ?? null,
				sellerKanrikunSaveTime: saveTime,
			};
			putSummaries.push(summary);
		}

		const tsvGzip = await tsvObjToTsvGzip(putSummaries);

		const url = await getWriteOnlySignedUrl(
			account.userId,
			'inventory-summaries.tsv.gz',
		);

		const putResponse = await fetch(url, {
			method: 'PUT',
			body: tsvGzip,
		});

		if (!putResponse.ok) {
			console.error('putResponse:', putResponse);
		}

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
