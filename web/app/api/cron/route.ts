import type { Middleware } from 'openapi-fetch';

import { createClient } from '@seller-kanrikun/db';
import {
	getAccountsByProviderId,
	refreshAccountsToken,
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
	let accounts = await getAccountsByProviderId(db, 'seller-central');

	// アカウントのアクセストークンをリフレッシュ
	accounts = await refreshAccountsToken(
		db,
		accounts,
		process.env.AMAZON_CLIENT_ID!,
		process.env.AMAZON_CLIENT_SECRET!,
		process.env.SP_API_CLIENT_ID!,
		process.env.SP_API_CLIENT_SECRET!,
	);

	// アカウントごとにループ
	for (const account of accounts) {
		// アクセストークンがない場合はスキップ
		if (account.accessToken === null) {
			console.error('accessToken is undefined');
			continue;
		}
		// アクセストークンを追加するミドルウェアを作成
		const tokenMiddleware: Middleware = {
			async onRequest({ request, options }) {
				request.headers.set('x-amz-access-token', account.accessToken!);
				return request;
			},
		};
		reportsClient.use(tokenMiddleware);

		const reportsFetch = new retryFetch(() =>
			reportsClient.GET('/reports/2021-06-30/reports', {
				params: {
					query: {
						reportTypes: [
							'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
						],
					},
				},
			}),
		);

		const reports = await reportsFetch.runWithTokenRetry();
		console.log('result token retry:', reports.response);
		if (reports.error) {
			console.error(reports.error);
		} else {
			console.log(reports.data);
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

// リトライ付きfetch
class retryFetch<Data, Error> {
	// 現状クラスである意味はないです
	func: () => Promise<fetchReturn<Data, Error>>;
	waitTimes: number[];

	constructor(
		func: () => Promise<fetchReturn<Data, Error>>,
		waitTimes: number[] = [0.5, 0.5, 0.5],
	) {
		this.func = func;
		this.waitTimes = waitTimes;
	}

	// トークンによるリトライ付きfetchを実行
	async runWithTokenRetry(count = 0): Promise<fetchReturn<Data, Error>> {
		const result = await this.func();
		// エラーがある場合はエラーをログ
		if (result.error) {
			console.error(result.error);
			// エラーがレートリミットの場合
			if (result.response.status === 429) {
				// リトライ回数が最後の場合はそのまま返す
				if (count === this.waitTimes.length - 1) {
					return result;
				}
				// 待機
				const retryTime = this.waitTimes[count];
				await waitRateLimitTime(result.response, retryTime);
				// リトライ
				return await this.runWithTokenRetry(count + 1);
			} else {
				return result;
			}
		}

		return result;
	}
}
