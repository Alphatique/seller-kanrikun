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
	startOfDay,
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
import {
	type SalesAndTrafficReportDocument,
	salesAndTrafficReportDocument,
	salesTrafficReportDocument,
} from '@seller-kanrikun/api-wrapper/schema/sales-traffic-report';
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
	SP_SELLER_KANRIKUN_BASE_URL,
} from '~/lib/constants';

import {
	type InventorySummaries,
	inventorySummaries,
} from '@seller-kanrikun/api-wrapper/schema/inventory';
import {
	type SettlementReportDocument,
	type SettlementReportMetas,
	settlementReportDocument,
	settlementReportMetas,
} from '@seller-kanrikun/api-wrapper/schema/settlement-reports';
import { jsonGzipArrayToJsonObj } from '@seller-kanrikun/data-operation/json-gzip';
import { gzipAndPutFile } from '~/lib/fetch-gzip';
import {
	getSpApiAccessToken,
	getSpApiAccessTokenAndExpiresAt,
} from '~/lib/token';
import {
	accessTokenMiddleware,
	authMiddleware,
	cronAuthMiddleware,
	dbMiddleware,
} from './middleware';

export const app = new Hono()
	.use(dbMiddleware)
	//.use(cronAuthMiddleware)
	.get('/settlement-report', async c => {
		const db = c.var.db;
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		const promises = accounts.map(async account => {
			let [accessToken, expiresAt] =
				await getSpApiAccessTokenAndExpiresAt(account.userId, db);

			const reportMetaResult = await getFile(
				account.userId,
				FILE_NAMES.SETTLEMENT_REPORT_META,
			);
			if (reportMetaResult.isErr()) {
				console.error(reportMetaResult.error, account.userId);
				return c.text('get exist report meta was failed', 500);
			}
			const reportMetaArray =
				await reportMetaResult.value.Body?.transformToByteArray();
			if (!reportMetaArray) {
				console.error('exist meta data was not found:', account.userId);
				return c.text('exist meta data was not found', 500);
			}
			const existReportMetas: SettlementReportMetas =
				jsonGzipArrayToJsonObj(reportMetaArray, settlementReportMetas);

			// レポートAPI
			const api = createApiClient<reportsPaths>({
				baseUrl: SP_SELLER_KANRIKUN_BASE_URL,
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
				existReportMetas,
			);

			if (reports.isErr()) {
				return c.text('get settlemenet reports was failed', 500);
			}

			const getReportResult =
				await getSettlementReportsDocumentRetryRateLimit(
					api,
					reports.value,
				);

			if (getReportResult.isErr()) {
				return c.text(
					'get settlemenet report documents was failed',
					500,
				);
			}

			const reportDocumentResult = await getFile(
				account.userId,
				FILE_NAMES.SETTLEMENT_REPORT_DOCUMENT,
			);
			if (reportDocumentResult.isErr()) {
				console.error(reportDocumentResult.error, account.userId);
				return c.text('get exist report document was failed', 500);
			}
			const reportDocumentArray =
				await reportDocumentResult.value.Body?.transformToByteArray();
			if (!reportDocumentArray) {
				console.error(
					'exist document data was not found:',
					account.userId,
				);
				return c.text('exist document data was not found', 500);
			}
			const existReportDocument: SettlementReportDocument =
				jsonGzipArrayToJsonObj(
					reportDocumentArray,
					settlementReportDocument,
				);

			const saveReportDocument = await filterSettlementReportDocument(
				existReportMetas,
				getReportResult.value,
			);

			const documentPutResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SETTLEMENT_REPORT_DOCUMENT,
				[...saveReportDocument, ...existReportDocument],
			);
			if (!documentPutResult) {
				console.error(
					'failed to put settlement report document:',
					account.userId,
				);
				return c.text('failed to put settlement report document', 500);
			}

			const metaPutResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SETTLEMENT_REPORT_META,
				[
					...existReportMetas,
					...getReportResult.value.map(row => row.report),
				],
			);
			if (!metaPutResult) {
				console.error(
					'failed to put settlement report meta:',
					account.userId,
				);
				return c.text('failed to put settlement report meta', 500);
			}
			console.log('success:', account.userId);
			return c.text('ok', {
				status: 200,
			});
		});

		await Promise.all(promises);

		return c.text('finish', 200);
	})
	.get('/sales-traffic-report', async c => {
		const db = c.var.db;
		const accounts = await getAccountsByProviderId(db, 'seller-central');

		const now = startOfDay(new Date());
		// 昨日
		const current = subDays(now, 1);
		console.log(current);

		const promises = accounts.map(async account => {
			const existReportResult = await getFile(
				account.userId,
				FILE_NAMES.SALES_TRAFFIC_REPORT,
			);
			if (existReportResult.isErr()) {
				console.error(existReportResult.error, account.userId);
				return c.text('get exist report document was failed', 500);
			}
			const reportDocumentArray =
				await existReportResult.value.Body?.transformToByteArray();
			if (!reportDocumentArray) {
				console.error(
					'exist document data was not found:',
					account.userId,
				);
				return c.text('exist document data was not found', 500);
			}

			const existReportDocument: SalesAndTrafficReportDocument =
				jsonGzipArrayToJsonObj(
					reportDocumentArray,
					salesAndTrafficReportDocument,
				);

			// 一日前
			const lastDay = subDays(current, 1);

			for (const reportDocument of existReportDocument) {
				console.log(
					reportDocument.dataStartTime,
					reportDocument.dataEndTime,
				);
				if (
					reportDocument.dataStartTime === lastDay &&
					reportDocument.dataEndTime === current
				) {
					console.error('report range was exist');
					return c.text('report range was exist', 500);
				}
			}

			let [accessToken, expiresAt] =
				await getSpApiAccessTokenAndExpiresAt(account.userId, db);

			// レポートAPI
			const reportsApi = createApiClient<reportsPaths>({
				baseUrl: SP_SELLER_KANRIKUN_BASE_URL,
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
				return c.text('create report was failed', {
					status: 500,
				});
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
				return c.text('failed to get report document id', {
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
					return c.text('failed to get report document', {
						status: 500,
					});
				}
				result.push(...documentResult.value);
				console.log(documentResult);
			}
			console.log(result);

			const putResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SALES_TRAFFIC_REPORT,
				[...existReportDocument, ...result],
			);
			if (!putResult) {
				console.error('put file was failed:', account.userId);
				return;
			}
			console.log('success:', account.userId);
			return;
		});

		await Promise.all(promises);

		return c.text('ok', 200);
	})
	.get('/inventory-summaries', async c => {
		const db = c.var.db;
		const accounts = await getAccountsByProviderId(db, 'seller-central');
		const promises = accounts.map(async account => {
			const existInventoryResult = await getFile(
				account.userId,
				FILE_NAMES.INVENTORY_SUMMARIES,
			);
			if (existInventoryResult.isErr()) {
				console.error(existInventoryResult.error, account.userId);
				return c.text('get exist inventory summaries was failed', 500);
			}
			const inventoryArray =
				await existInventoryResult.value.Body?.transformToByteArray();
			if (!inventoryArray) {
				console.error(
					'exist inventory data was not found:',
					account.userId,
				);
				return c.text('exist inventory data was not found', 500);
			}
			const existInventorySummaries: InventorySummaries =
				jsonGzipArrayToJsonObj(inventoryArray, inventorySummaries);

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
				baseUrl: SP_SELLER_KANRIKUN_BASE_URL,
			});
			api.use(tokenMiddleware);
			const newInventorySummaries =
				await getAllInventorySummariesRetryRateLimit(api);
			if (newInventorySummaries.isErr()) {
				return c.text('get inventory-summaries was failed', 500);
			}

			const putResult = await gzipAndPutFile(
				account.userId,
				FILE_NAMES.SALES_TRAFFIC_REPORT,
				[...existInventorySummaries, ...newInventorySummaries.value],
			);
			if (!putResult) {
				console.error('put file was failed:', account.userId);
				return c.text('put file was failed', 500);
			}
			console.log('success:', account.userId);
			return c.text('ok', 200);
		});

		await Promise.all(promises);

		return c.text('ok', 200);
	});
