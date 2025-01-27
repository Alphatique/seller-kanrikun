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

import { getAllCatalogSummariesRetryRateLimit } from '@seller-kanrikun/api-wrapper/category';
import { getAllInventorySummariesRetryRateLimit } from '@seller-kanrikun/api-wrapper/inventory';
import {
	createSalesTrafficReportRetryRateLimit,
	getAllSalesTrafficReportsRetryRateLimit,
	getCreatedReportDocumentIdRetryRateLimit,
	getSalesTrafficReportDocumentRetryRateLimit,
} from '@seller-kanrikun/api-wrapper/sales-traffic-report';
import type { SalesAndTrafficReportDocument } from '@seller-kanrikun/api-wrapper/schema/sales-traffic-report';
import {
	getAllSettlementReportsRetryRateLimit,
	getAllSettlementReportsUntilRateLimit,
	getSettlementReportsDocumentRetryRateLimit,
} from '@seller-kanrikun/api-wrapper/settlement-report';
import { getFile, putFile } from '@seller-kanrikun/data-operation/r2';
import {
	getAccountsByProviderId,
	refreshAccessToken,
} from '@seller-kanrikun/db/account';
import type { paths as catalogPaths } from '@seller-kanrikun/sp-api/schema/catalog-items';
import type { paths as inventoryPaths } from '@seller-kanrikun/sp-api/schema/fba-inventory';
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
			console.log(settlementReports);

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
		const endDate = subWeeks(now, 3); //subYears(now, 2);
		// 昨日
		let current = subDays(sunDay, 1);

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

			const reportIds: string[] = [];
			while (true) {
				// 一日前
				const lastDay = subDays(current, 1);

				console.log(
					'start get sales traffic report:',
					lastDay,
					' to ',
					current,
				);
				const reportId = await createSalesTrafficReportRetryRateLimit(
					reportsApi,
					lastDay,
					current,
					120 * 1000,
				);
				if (reportId.isErr()) {
					return new Response('failed to create report', {
						status: 500,
					});
				}
				console.log('report id:', reportId);

				console.log('waiting...');
				await new Promise(resolve => setTimeout(resolve, 60 * 1000));
				const reportDocumentId =
					await getCreatedReportDocumentIdRetryRateLimit(
						reportsApi,
						reportId.value,
						30 * 1000,
						0.5 * 1000,
					);

				if (reportDocumentId === null) {
					return new Response('failed to get report document id', {
						status: 500,
					});
				}
				console.log('report document id:', reportDocumentId);
				const documentResult =
					await getSalesTrafficReportDocumentRetryRateLimit(
						reportsApi,
						reportDocumentId,
						120 * 1000,
					);

				if (documentResult.isErr()) {
					return new Response('failed to get report document', {
						status: 500,
					});
				}
				console.log(
					'document row length:',
					documentResult.value.length,
				);

				result.push(...documentResult.value);

				// 現在を更新
				current = lastDay;
				// 終了日を超えたら終了
				if (isBefore(current, endDate)) {
					break;
				}
			}
		});

		await Promise.all(promises);

		return new Response('ok', {
			status: 200,
		});
	})
	.get('inventory', async c => {
		const db = c.var.db;
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		for (const account of accounts) {
			let [accessToken, expiresAt] =
				await getSpApiAccessTokenAndExpiresAt(account.userId, db);
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
			const api = createApiClient<inventoryPaths>({
				baseUrl: SELLER_API_BASE_URL,
			});
			api.use(tokenMiddleware);
			const inventorySummaries =
				await getAllInventorySummariesRetryRateLimit(api);

			console.log(inventorySummaries);
		}

		return new Response('ok', {
			status: 200,
		});
	});
