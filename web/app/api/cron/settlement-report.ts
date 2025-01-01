import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { gzipSync } from 'fflate';
import type { Middleware } from 'openapi-fetch';
import createApiClient from 'openapi-fetch';
import Papa from 'papaparse';

import { getWriteOnlySignedUrl } from '@seller-kanrikun/data-operation/r2';
import { createClient as createDBClient } from '@seller-kanrikun/db';
import {
	getAccountsByProviderId,
	refreshAccessToken,
} from '@seller-kanrikun/db/account';
import type { paths } from '@seller-kanrikun/sp-api/schema/reports';

import { FILE_NAMES, R2_BUCKET_NAME } from '~/lib/constants';

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

		// レポートの一覧を取得
		const reportsResponses = await fetchWithRetryNextToken(nextToken => {
			// ネクストトークン次第でパラメータを変更
			const params =
				nextToken === null
					? {
							// 初回取得
							query: {
								reportTypes: [
									'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
								],
								pageSize: 100, // 最大を指定
							},
						}
					: {
							// ネクストトークンがある場合
							query: {
								nextToken: nextToken,
							},
						};
			// リトライ付きfetchを実行
			return fetchWithRetryRateLimit(
				() =>
					api.GET('/reports/2021-06-30/reports', {
						params,
					}),
				[2, 2, 2],
			);
		});

		let lastResponse: Response | undefined;
		const allColumns = new Set<string>();
		const documentsData: Record<string, string>[] = [];

		// レポートレスポンスごとにループ
		for (const reportsResponse of reportsResponses) {
			if (lastResponse) {
				console.log('response:', lastResponse);
				await waitRateLimitTime(lastResponse, 50);
			}

			logFetchReturn(reportsResponse, 'fetch reports');
			if (!reportsResponse.data) continue; // データがない場合はスキップ
			// レポートメタデータごとにループ
			for (const reportMeta of reportsResponse.data.reports) {
				const reportDocumentId = reportMeta.reportDocumentId;
				// レポートドキュメントIDがない場合はスキップ
				if (reportDocumentId === undefined) {
					console.error('reportDocumentId is undefined', reportMeta);
					continue;
				}
				// レポートドキュメントの取得
				const reportDocument = await fetchWithRetryRateLimit(
					() =>
						api.GET(
							'/reports/2021-06-30/documents/{reportDocumentId}',
							{
								params: {
									path: {
										reportDocumentId: reportDocumentId,
									},
								},
							},
						),
					[60, 5, 60],
				);
				logFetchReturn(reportDocument, 'fetch reportDocument');
				lastResponse = reportDocument.response;
				if (!reportDocument.data) continue; // データがない場合はスキップ

				// CSV行を貯める配列
				const newRows: Record<string, string>[] = [];

				// レポートドキュメントの取得
				const reportDocumentResponse = await fetch(
					reportDocument.data!.url!,
					{
						method: 'GET',
					},
				);
				// レポートドキュメントの取得に失敗した場合はスキップ
				if (!reportDocumentResponse.ok) {
					console.error('Failed to fetch report document');
					continue;
				}

				// レポートドキュメントのストリームを取得
				const webReadableStream =
					reportDocumentResponse.body as unknown as WebReadableStream<Uint8Array>;
				const nodeStream = Readable.fromWeb(webReadableStream);

				// パース用のPapaparseストリームを作成
				const papaStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
					header: true, // CSVヘッダーの有無
					delimiter: '\t', // 必要に応じて区切り文字を設定
				});

				// パース時のイベントハンドラ
				papaStream.on('data', (row: Record<string, string>) => {
					for (const key of Object.keys(row)) {
						allColumns.add(key);
					}
					newRows.push(row);
				});

				// パース完了時
				papaStream.on('end', () => {
					console.log('Parsing complete.');
					console.log('New rows:', newRows.length);
					documentsData.push(...newRows);
				});

				// エラーハンドリング
				papaStream.on('error', error => {
					console.error('Error parsing CSV:', error);
				});

				// ストリームにパイプしてパース開始
				nodeStream.pipe(papaStream);
			}
		}

		const finalColumns = Array.from(allColumns);
		const joinData = documentsData.map(row =>
			Object.fromEntries(finalColumns.map(col => [col, row[col] ?? ''])),
		);

		// テキスト→Uint8Arrayエンコード（UTF-8想定）
		const csvContent = `${finalColumns.join('\t')}\n${joinData
			.map(row => finalColumns.map(col => row[col]).join('\t'))
			.join('\n')}`;

		const tsvStr = Papa.unparse(finalColumns, {
			delimiter: '\t',
			header: true,
		});

		const encoder = new TextEncoder();
		const csvUint8 = encoder.encode(tsvStr);

		const gzipped = gzipSync(csvUint8);

		const url = await getWriteOnlySignedUrl(
			R2_BUCKET_NAME,
			account.userId,
			FILE_NAMES.SETTLEMENT_REPORT,
		);
		/*
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/gzip',
			},
			body: gzipped,
		});
		console.log('response:', response);
		*/
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
