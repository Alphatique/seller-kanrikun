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
	filterSettlementReportDocument,
	getAllSettlementReportsRetryRateLimit,
	getAllSettlementReportsUntilRateLimit,
	getSettlementReportsDocumentRetryRateLimit,
} from '@seller-kanrikun/api-wrapper/settlement-report';
import {
	existFile,
	getFile,
	putFile,
} from '@seller-kanrikun/data-operation/r2';
import {
	getAccountsByProviderId,
	refreshAccessToken,
} from '@seller-kanrikun/db/account';
import { type ClientType, createClient } from '@seller-kanrikun/db/index';
import type { paths as catalogPaths } from '@seller-kanrikun/sp-api/schema/catalog-items';
import type { paths as inventoryPaths } from '@seller-kanrikun/sp-api/schema/fba-inventory';
import type { paths as reportsPaths } from '@seller-kanrikun/sp-api/schema/reports';

import {
	FILE_NAMES,
	JAPAN_MARKET_PLACE_ID,
	R2_BUCKET_NAME,
} from '~/lib/constants';

import {
	SettlementReportMeta,
	type SettlementReportMetas,
	settlementReportMetas,
} from '@seller-kanrikun/api-wrapper/schema/settlement-reports';
import { jsonGzipArrayToJsonObj } from '@seller-kanrikun/data-operation/json-gzip';
import { gzipAndPutFile } from '~/lib/fetch-gzip';
import {
	getSpApiAccessToken,
	getSpApiAccessTokenAndExpiresAt,
} from '~/lib/token';
import { cronApp as init } from './init';
import {
	accessTokenMiddleware,
	authMiddleware,
	cronAuthMiddleware,
	dbMiddleware,
} from './middleware';

export const app = new Hono()
	.use(dbMiddleware)
	.use(cronAuthMiddleware)
	.route('/init', init)
	.get('/', async c => {
		const promises = [
			fetchCron('/settlement-report'),
			fetchCron('/sales-traffic-report'),
			fetchCron('/inventory-summaries'),
		];

		await Promise.all(promises);

		return new Response('ok', {
			status: 200,
		});
	})
	.get('/settlement-report', async c => {
		const db = c.var.db;
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		const promises = accounts.map(async account => {
			const initRes = await fetchCron(
				'/init/settlement-report',
				account.userId,
			);
			if (!(initRes.status === 200 || initRes.status === 409)) {
				console.error('first was failed:', account.userId);
				return;
			}

			let [accessToken, expiresAt] =
				await getSpApiAccessTokenAndExpiresAt(account.userId, db);

			const reportMetaResult = await getFile(
				R2_BUCKET_NAME,
				account.userId,
				FILE_NAMES.SETTLEMENT_REPORT_META,
			);
			if (reportMetaResult.isErr()) {
				console.error(reportMetaResult.error, account.userId);
				return;
			}
			const reportMetaArray =
				await reportMetaResult.value.Body?.transformToByteArray();
			if (!reportMetaArray) {
				console.error('exist meta data was not found:', account.userId);
				return;
			}
			const reportMetas: SettlementReportMetas = jsonGzipArrayToJsonObj(
				reportMetaArray,
				settlementReportMetas,
			);

			// レポートAPI
			const api = createApiClient<reportsPaths>({
				baseUrl: process.env.API_BASE_URL,
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
			api.use(tokenMiddleware);

			const reports = await getAllSettlementReportsRetryRateLimit(
				api,
				reportMetas,
			);

			const reportResult =
				await getSettlementReportsDocumentRetryRateLimit(api, reports);
			const reportDocument = await filterSettlementReportDocument(
				reportMetas,
				reportResult,
			);

			const documentPutResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SETTLEMENT_REPORT_DOCUMENT,
				reportDocument,
			);
			if (!documentPutResult) {
				console.error(
					'failed to put settlement report document:',
					account.userId,
				);
				return;
			}

			const metaPutResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SETTLEMENT_REPORT_META,
				reportResult.map(row => row.report),
			);
			if (!metaPutResult) {
				console.error(
					'failed to put settlement report meta:',
					account.userId,
				);
				return;
			}
			console.log('success:', account.userId);
			return;
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

		const promises = accounts.map(async account => {
			const initRes = await fetchCron(
				'/init/sales-traffic-report',
				account.userId,
			);

			if (!(initRes.status === 200 || initRes.status === 409)) {
				console.error('first was failed:', account.userId);
				return;
			}
			let [accessToken, expiresAt] =
				await getSpApiAccessTokenAndExpiresAt(account.userId, db);

			// レポートAPI
			const reportsApi = createApiClient<reportsPaths>({
				baseUrl: process.env.API_BASE_URL,
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

			const result: SalesAndTrafficReportDocument = [];
			while (true) {
				// 一日前
				const lastDay = subDays(current, 1);

				const reportId = await createSalesTrafficReportRetryRateLimit(
					reportsApi,
					lastDay,
					current,
					120 * 1000,
				);
				if (reportId.isErr()) {
					console.error('failed to create report', account.userId);
					return;
				}

				await new Promise(resolve => setTimeout(resolve, 60 * 1000));
				const reportDocumentId =
					await getCreatedReportDocumentIdRetryRateLimit(
						reportsApi,
						reportId.value,
						30 * 1000,
						0.5 * 1000,
					);

				if (reportDocumentId === null) {
					console.error(
						'failed to get report document id',
						account.userId,
					);
					return;
				}
				const documentResult =
					await getSalesTrafficReportDocumentRetryRateLimit(
						reportsApi,
						reportDocumentId,
						120 * 1000,
					);

				if (documentResult.isErr()) {
					console.error(
						'failed to get report document',
						account.userId,
					);
					return;
				}
				result.push(...documentResult.value);

				// 現在を更新
				current = lastDay;
				// 終了日を超えたら終了
				if (isBefore(current, endDate)) {
					break;
				}
			}

			const putResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SALES_TRAFFIC_REPORT,
				result,
			);
			if (!putResult) {
				console.error('put file was failed:', account.userId);
				return;
			}
			console.log('success:', account.userId);
			return;
		});

		await Promise.all(promises);

		return new Response('ok', {
			status: 200,
		});
	})
	.get('/inventory-summaries', async c => {
		const db = c.var.db;
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		const promises = accounts.map(async account => {
			const initRes = await fetchCron(
				'/init/inventory-summaries',
				account.userId,
			);

			if (!(initRes.status === 200 || initRes.status === 409)) {
				console.error('first was failed:', account.userId);
				return;
			}

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
				baseUrl: process.env.API_BASE_URL,
			});
			api.use(tokenMiddleware);
			const inventorySummaries =
				await getAllInventorySummariesRetryRateLimit(api);

			const putResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SALES_TRAFFIC_REPORT,
				inventorySummaries,
			);
			if (!putResult) {
				console.error('put file was failed:', account.userId);
				return;
			}
			console.log('success:', account.userId);
			return;
		});

		await Promise.all(promises);

		return new Response('ok', {
			status: 200,
		});
	});

async function fetchCron(path: string, userId: string | undefined = undefined) {
	const headers: Record<string, string> = {
		Authorization: `Bearer ${process.env.CRON_TOKEN!}`,
	};

	if (userId) {
		headers['X-Cron-UserId'] = userId;
	}

	return fetch(`${process.env.API_BASE_URL}/api/cron${path}`, {
		headers: headers,
	});
}
