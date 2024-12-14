import type { Middleware } from 'openapi-fetch';

import { createClient } from '@seller-kanrikun/db';
import {
	getAccountsByProviderId,
	refreshAccessToken,
} from '@seller-kanrikun/db/account';
import { reportsClient } from '@seller-kanrikun/sp-api/client/reports';

const japanMarketPlaceId = 'A1VC38T7YXB528';

export async function GET(request: Request) {
	// DBクライアントを作成
	const db = createClient({
		url: process.env.TURSO_CONNECTION_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	});

	// セラーセントラルのアカウントを全取得
	const accounts = await getAccountsByProviderId(db, 'seller-central');

	// アカウントごとにループ
	for (let account of accounts) {
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
		reportsClient.use(tokenMiddleware);

		// レポートの一覧を取得
		const reports = await fetchWithRetryNextToken(nextToken => {
			if (nextToken !== null) {
				return fetchWithRetryTokenLimit(() =>
					reportsClient.GET('/reports/2021-06-30/reports', {
						params: {
							query: {
								nextToken: nextToken,
							},
						},
					}),
				);
			}
			return fetchWithRetryTokenLimit(() =>
				reportsClient.GET('/reports/2021-06-30/reports', {
					params: {
						query: {
							reportTypes: [
								'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
							],
							pageSize: 10, // 最大を指定
						},
					},
				}),
			);
		});

		// 結果を出力
		console.log('result token retry:', reports);
		for (const report of reports) {
			if (report.error) {
				console.error(report.error);
			} else {
				console.log(report.data);
			}
		}

		reportsClient.eject(tokenMiddleware);
	}

	return new Response('henohenomoheji', {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}

async function waitRateLimitTime(response: Response, defaultTime: number) {
	const limitStr = response.headers.get('x-amzn-RateLimit-Limit');
	const waitTime =
		limitStr !== null && !Number.isNaN(Number(limitStr))
			? Number(limitStr)
			: defaultTime;
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

	let nextToken: string | undefined | null = null;
	while (nextToken !== undefined) {
		const result = await func(nextToken);
		results.push(result);
		if (result.error) break;
		nextToken = result.data?.nextToken;
		await waitRateLimitTime(result.response, waitTime);
	}
	return results;
}

// トークンによるリトライ付きfetchを実行
async function fetchWithRetryTokenLimit<Data, Error>(
	func: () => Promise<fetchReturn<Data, Error>>,
	count = 0,
	waitTimes: number[] = [0.5, 0.5, 0.5],
): Promise<fetchReturn<Data, Error>> {
	const result = await func();
	// エラーがレートリミットの場合
	if (result.response.status === 429) {
		// リトライ回数が最後の場合はそのまま返す
		if (count === waitTimes.length - 1) {
			return result;
		}
		// エラーをログ
		console.error(result.error);
		// 待機
		const retryTime = waitTimes[count];
		await waitRateLimitTime(result.response, retryTime);
		// リトライ
		return await fetchWithRetryTokenLimit(func, count + 1, waitTimes);
	}
	return result;
}
