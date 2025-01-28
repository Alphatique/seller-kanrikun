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
	SP_API_BASE_URL,
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
				console.error('init was failed:', account.userId);
				return new Response('init settlement-report was failed', {
					status: 500,
				});
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
				return new Response('get exist report meta was failed', {
					status: 500,
				});
			}
			const reportMetaArray =
				await reportMetaResult.value.Body?.transformToByteArray();
			if (!reportMetaArray) {
				console.error('exist meta data was not found:', account.userId);
				return new Response('exist meta data was not found', {
					status: 500,
				});
			}
			const reportMetas: SettlementReportMetas = jsonGzipArrayToJsonObj(
				reportMetaArray,
				settlementReportMetas,
			);

			// レポートAPI
			const api = createApiClient<reportsPaths>({
				baseUrl: SP_API_BASE_URL,
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

			if (reports.isErr()) {
				return new Response('get settlemenet reports was failed', {
					status: 500,
				});
			}

			const reportResult =
				await getSettlementReportsDocumentRetryRateLimit(
					api,
					reports.value,
				);

			if (reportResult.isErr()) {
				return new Response(
					'get settlemenet report documents was failed',
					{
						status: 500,
					},
				);
			}

			const reportDocument = await filterSettlementReportDocument(
				reportMetas,
				reportResult.value,
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
				return new Response(
					'failed to put settlement report document',
					{
						status: 500,
					},
				);
			}

			const metaPutResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SETTLEMENT_REPORT_META,
				reportResult.value.map(row => row.report),
			);
			if (!metaPutResult) {
				console.error(
					'failed to put settlement report meta:',
					account.userId,
				);
				return new Response('failed to put settlement report meta', {
					status: 500,
				});
			}
			console.log('success:', account.userId);
			return new Response('ok', {
				status: 200,
			});
		});

		await Promise.all(promises);

		return new Response('finish', {
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
				console.error('init was failed:', account.userId);
				return new Response('init sales-traffic-report was failed', {
					status: 500,
				});
			}
			let [accessToken, expiresAt] =
				await getSpApiAccessTokenAndExpiresAt(account.userId, db);

			// レポートAPI
			const reportsApi = createApiClient<reportsPaths>({
				baseUrl: SP_API_BASE_URL,
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
					console.error(
						'failed to create report: ',
						reportId.error,
						', ',
						account.userId,
					);
					console.error('create report was failed:', account.userId);
					return new Response(
						'init sales-traffic-report was failed',
						{
							status: 500,
						},
					);
				}

				await new Promise(resolve => setTimeout(resolve, 60 * 1000));
				const reportDocumentId =
					await getCreatedReportDocumentIdRetryRateLimit(
						reportsApi,
						reportId.value,
						30 * 1000,
						0.5 * 1000,
					);

				if (reportDocumentId.isErr()) {
					console.error(
						'failed to get report document id',
						account.userId,
					);
					return new Response('failed to get report document id', {
						status: 500,
					});
				}
				if (reportDocumentId.value === null) {
					console.warn('report document id was null');
				} else {
					const documentResult =
						await getSalesTrafficReportDocumentRetryRateLimit(
							reportsApi,
							reportDocumentId.value,
							120 * 1000,
						);

					if (documentResult.isErr()) {
						console.error(
							'failed to get report document',
							account.userId,
						);
						return new Response('failed to get report document', {
							status: 500,
						});
					}
					result.push(...documentResult.value);
				}

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
				console.error('init was failed:', account.userId);
				return new Response('init inventory-summaries was failed', {
					status: 500,
				});
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
				baseUrl: SP_API_BASE_URL,
			});
			api.use(tokenMiddleware);
			const inventorySummaries =
				await getAllInventorySummariesRetryRateLimit(api);

			if (inventorySummaries.isErr()) {
				return new Response('get inventory-summaries was failed', {
					status: 500,
				});
			}

			const putResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SALES_TRAFFIC_REPORT,
				inventorySummaries.value,
			);
			if (!putResult) {
				console.error('put file was failed:', account.userId);
				return new Response('put file was failed', {
					status: 500,
				});
			}
			console.log('success:', account.userId);
			return new Response('ok', {
				status: 200,
			});
		});

		await Promise.all(promises);

		return new Response('ok', {
			status: 200,
		});
	});

async function fetchCron(path: string, userId: string | undefined = undefined) {
	const headers: Record<string, string> = {
		authorization: `Bearer ${process.env.CRON_SECRET!}`,
	};

	if (userId) {
		headers['X-Cron-UserId'] = userId;
	}

	return fetch(`${process.env.API_BASE_URL}/api/cron${path}`, {
		headers: headers,
	});
}
