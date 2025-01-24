import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import {
	addWeeks,
	addYears,
	endOfWeek,
	isAfter,
	isBefore,
	max,
	min,
	startOfWeek,
	subDays,
	subWeeks,
	subYears,
} from 'date-fns';
import { Hono } from 'hono';
import createApiClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import Papa from 'papaparse';

import {
	createSalesTrafficReportRetryRateLimit,
	getAllSalesTrafficReportsRetryRateLimit,
	getAllSalesTrafficReportsUntilRateLimit,
	getCreatedReportDocumentIdRetryRateLimit,
	getSalesTrafficReportDocumentRetryRateLimit,
} from '@seller-kanrikun/api-wrapper/sales-traffic-report';
import type { SalesAndTrafficReportDocument } from '@seller-kanrikun/api-wrapper/schema/sales-traffic-report';
import {
	getAllSettlementReportsRetryRateLimit,
	getAllSettlementReportsUntilRateLimit,
	getSettlementReportsDocumentRetryRateLimit,
} from '@seller-kanrikun/api-wrapper/settlement-report';
import {
	getAccountsByProviderId,
	refreshAccessToken,
} from '@seller-kanrikun/db/account';
import type { paths as reportsPaths } from '@seller-kanrikun/sp-api/schema/reports';

import {
	FILE_NAMES,
	JAPAN_MARKET_PLACE_ID,
	R2_BUCKET_NAME,
	SELLER_API_BASE_URL,
} from '~/lib/constants';

import {
	getSpApiAccessToken,
	getSpApiAccessTokenAndExpiresAt,
} from '~/lib/token';
import {
	accessTokenMiddleware,
	authMiddleware,
	dbMiddleware,
} from './middleware';

export const app = new Hono()
	.use(authMiddleware)
	.use(dbMiddleware)
	.get('/settlement-report', async c => {
		const db = c.var.db;
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		const promises = accounts.map(async account => {
			let [accessToken, expiresAt] =
				await getSpApiAccessTokenAndExpiresAt(account.userId, db);

			// レポートAPI
			const reportsApi = createApiClient<reportsPaths>({
				baseUrl: SELLER_API_BASE_URL,
			});

			const tokenMiddleware: Middleware = {
				async onRequest({ request, options }) {
					// トークンが期限切れをしていたら再生成
					if (new Date().getTime() > expiresAt.getTime()) {
						[accessToken, expiresAt] =
							await getSpApiAccessTokenAndExpiresAt(
								account.userId,
								db,
							);
					}
					// リクエストにアクセストークンを追加
					request.headers.set('x-amz-access-token', accessToken);
					return request;
				},
			};
			reportsApi.use(tokenMiddleware);

			const settlementReports =
				await getAllSettlementReportsRetryRateLimit(reportsApi, []);

			const settlementReportDocuments =
				await getSettlementReportsDocumentRetryRateLimit(
					reportsApi,
					settlementReports,
				);

			await writeFile(
				`./settlementReportDocuments-${account.userId}.json`,
				JSON.stringify(settlementReportDocuments, null, 2),
				'utf8',
			);
		});

		await Promise.all(promises);

		return new Response('ok', {
			status: 200,
		});
	})
	.get('/sales-traffic-report', accessTokenMiddleware, async c => {
		const db = c.var.db;
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		const now = new Date();
		const sunDay = startOfWeek(now, { weekStartsOn: 1 });

		const result: SalesAndTrafficReportDocument = [];
		const promises = accounts.map(async account => {
			let [accessToken, expiresAt] =
				await getSpApiAccessTokenAndExpiresAt(account.userId, db);

			// レポートAPI
			const reportsApi = createApiClient<reportsPaths>({
				baseUrl: SELLER_API_BASE_URL,
			});

			const tokenMiddleware: Middleware = {
				async onRequest({ request, options }) {
					// トークンが期限切れをしていたら再生成
					if (new Date().getTime() > expiresAt.getTime()) {
						[accessToken, expiresAt] =
							await getSpApiAccessTokenAndExpiresAt(
								account.userId,
								db,
							);
					}
					// リクエストにアクセストークンを追加
					request.headers.set('x-amz-access-token', accessToken);
					return request;
				},
			};
			reportsApi.use(tokenMiddleware);

			// 昨日
			let current = subDays(sunDay, 1);

			const endDate = subWeeks(now, 3); //subYears(now, 2);

			const reportIds: string[] = [];
			while (true) {
				// 一日前
				const end = subDays(current, 1);
				const reportId = await createSalesTrafficReportRetryRateLimit(
					reportsApi,
					current,
					end,
					120 * 1000,
				);
				if (!reportId) {
					console.error('create report was failed');
					return;
				}

				const reportDocumentResult =
					await getCreatedReportDocumentIdRetryRateLimit(
						reportsApi,
						reportId,
						30 * 1000,
						0.5 * 1000,
					);

				if (!reportDocumentResult) {
					console.error('get report document was failed');
					return;
				}
				const [reportDocumentId, retryTime]: [string, number] =
					reportDocumentResult;
				if (!reportDocumentId) {
					console.error('report document was not found');
					return;
				}
				const documentResult =
					await getSalesTrafficReportDocumentRetryRateLimit(
						reportsApi,
						reportDocumentId,
						120 * 1000,
					);

				if (!documentResult) {
					console.error('get report document data was failed');
					return;
				}

				result.concat(documentResult);

				// 現在を更新
				current = end;
				// 終了日を超えたら終了
				if (isBefore(current, endDate)) {
					break;
				}

				const waitTime = 60 * 1000 - retryTime;
				console.log(current);
				await new Promise(resolve => setTimeout(resolve, waitTime));
			}

			await writeFile(
				`./salesTrafficReportDocuments-${account.userId}.json`,
				JSON.stringify(result, null, 2),
				'utf8',
			);
		});

		await Promise.all(promises);

		return new Response('ok', {
			status: 200,
		});
	});
