import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { waitUntil } from '@vercel/functions';
import { Hono } from 'hono';
import createApiClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';

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
import { gunzipSync, gzip } from 'fflate';

import { getAllCatalogSummariesUntilRateLimit } from '@seller-kanrikun/api-wrapper/category';
import { getAllInventorySummariesUntilRateLimit } from '@seller-kanrikun/api-wrapper/inventory';
import {
	createAllSalesTrafficReportsUntilRateLimit,
	createSalesTrafficReport,
	createSalesTrafficReportRetryRateLimit,
	getAllCreatedReportDocumentIdsRetryRateLimit,
	getAllSalesTrafficReportDocumentRetryRateLimit,
	getAllSalesTrafficReportDocumentUntilRateLimit,
	getAllSalesTrafficReportsRetryRateLimit,
	getCreatedReport,
	getCreatedReportDocumentIdRetryRateLimit,
	getSalesTrafficReportDocumentRetryRateLimit,
	getSalesTrafficReportDocumentUntilRateLimit,
} from '@seller-kanrikun/api-wrapper/sales-traffic-report';
import type { SalesAndTrafficReportDocument } from '@seller-kanrikun/api-wrapper/schema/sales-traffic-report';
import {
	filterSettlementReportDocument,
	getAllSettlementReportsUntilRateLimit,
	getSettlementReportsDocumentRetryRateLimit,
	getSettlementReportsDocumentUntilRateLimit,
} from '@seller-kanrikun/api-wrapper/settlement-report';
import { jsonObjToJsonGzipArray } from '@seller-kanrikun/data-operation/json-gzip';
import {
	existFile,
	getFile,
	putFile,
} from '@seller-kanrikun/data-operation/r2';
import { InventorySummary } from '@seller-kanrikun/data-operation/types/inventory';
import type { User } from '@seller-kanrikun/db/schema';
import type { paths as catalogPaths } from '@seller-kanrikun/sp-api/schema/catalog-items';
import type { paths as inventoryPaths } from '@seller-kanrikun/sp-api/schema/fba-inventory';
import type { paths as reportsPaths } from '@seller-kanrikun/sp-api/schema/reports';

import {
	FILE_NAMES,
	JAPAN_MARKET_PLACE_ID,
	SP_SELLER_KANRIKUN_BASE_URL,
} from '~/lib/constants';
import { gzipAndPutFile } from '~/lib/fetch-gzip';
import { getSpApiAccessTokenAndExpiresAt } from '~/lib/token';

import {
	accessTokenMiddleware,
	authMiddleware,
	cronAuthMiddleware,
	dbMiddleware,
} from './middleware';

const salesTrafficReportLimit = 7;
const settlementReportLimit = 15 - salesTrafficReportLimit;

export const app = new Hono()
	.use(dbMiddleware)
	.use(authMiddleware)
	.use(accessTokenMiddleware)
	.get('/cost-price', async c => {
		const userId = c.var.user.id;
		const exist = await existFile(userId, FILE_NAMES.COST_PRICE);

		if (exist) {
			return new Response('already exists', {
				status: 409,
			});
		}

		const putResult = await gzipAndPutFile(
			userId,
			FILE_NAMES.COST_PRICE,
			[],
		);
		if (!putResult) {
			return new Response('failed to put', {
				status: 500,
			});
		}

		return new Response('ok', {
			status: 200,
		});
	})
	.get('/settlement-report', async c => {
		const userId = c.var.user.id;
		// メタファイルがなければとする
		const exist = await existFile(
			userId,
			FILE_NAMES.SETTLEMENT_REPORT_META,
		);
		if (exist) {
			return new Response('already exists', {
				status: 409,
			});
		}

		const accessToken = c.var.spApiAccessToken;
		const api = createApi<reportsPaths>(accessToken);

		console.log('get settlement report...');
		const reports = await getAllSettlementReportsUntilRateLimit(api, []);
		if (reports.isErr()) {
			return new Response('get settlement reports was failed', {
				status: 500,
			});
		}

		let limitedReports = reports.value;

		// sales-traffic分余裕を持たせる
		const reportsLimit = settlementReportLimit;
		if (reports.value.length > settlementReportLimit) {
			limitedReports = limitedReports.slice(0, reportsLimit);
		}
		console.log('settlement report:', reports.value.length);
		console.log('get settlement report document...');
		const reportResult = await getSettlementReportsDocumentUntilRateLimit(
			api,
			reports.value,
		);
		if (reportResult.isErr()) {
			return new Response('get settlement report documents was failed', {
				status: 500,
			});
		}
		console.log('settlement report document:', reportResult.value.length);

		const documentPutResult = await gzipAndPutFile(
			userId,
			FILE_NAMES.SETTLEMENT_REPORT_DOCUMENT,
			reportResult.value.flatMap(row => row.document),
		);
		if (!documentPutResult) {
			return new Response('failed to put settlement report document', {
				status: 500,
			});
		}
		const metaPutResult = await gzipAndPutFile(
			userId,
			FILE_NAMES.SETTLEMENT_REPORT_META,
			reportResult.value.flatMap(row => row.report),
		);
		if (!metaPutResult) {
			return new Response('failed to put settlement report meta', {
				status: 500,
			});
		}

		return new Response('ok', {
			status: 200,
		});
	})
	.get('/sales-traffic-report', async c => {
		const userId = c.var.user.id;
		const exist = await existFile(userId, FILE_NAMES.SALES_TRAFFIC_REPORT);
		if (exist) {
			return new Response('already exists', {
				status: 409,
			});
		}

		const accessToken = c.var.spApiAccessToken;
		const api = createApi<reportsPaths>(accessToken);
		console.log('create sales traffic reports...');
		const nowStart = startOfDay(new Date());
		const reportIds = await createAllSalesTrafficReportsUntilRateLimit(
			api,
			subDays(nowStart, 1),
			subWeeks(nowStart, 2),
		);

		if (reportIds.isErr()) {
			return new Response('failed to create sales traffic report', {
				status: 500,
			});
		}
		console.log('sales traffic reports:', reportIds);

		// レポート作成まで時間がかかるため、一度空白でput
		const firstPutResult = await gzipAndPutFile(
			userId,
			FILE_NAMES.SALES_TRAFFIC_REPORT,
			[],
		);
		if (!firstPutResult) {
			console.error('failed to first put');
			return new Response('put file was failed', {
				status: 500,
			});
		}

		waitUntil(
			(async () => {
				const reportDocumentIds =
					await getAllCreatedReportDocumentIdsRetryRateLimit(
						api,
						reportIds.value,
					);
				if (reportDocumentIds.isErr()) {
					console.error(
						'erro get report document ids:',
						reportDocumentIds.error,
					);
					return;
				}

				const reportDocument =
					await getAllSalesTrafficReportDocumentUntilRateLimit(
						api,
						reportDocumentIds.value,
					);

				if (reportDocument.isErr()) {
					console.error(
						'erro get report document:',
						reportDocument.error,
					);
					return;
				}

				const firstPutResult = await gzipAndPutFile(
					userId,
					FILE_NAMES.SALES_TRAFFIC_REPORT,
					reportDocument.value,
				);
				if (!firstPutResult) {
					console.error('failed to first put');
					return;
				}

				console.log('success to put report document');
				return;
			})(),
		);

		return new Response('ok', {
			status: 200,
		});
	})
	.get('/inventory-summaries', async c => {
		const userId = c.var.user.id;

		const exist = await existFile(userId, FILE_NAMES.INVENTORY_SUMMARIES);
		if (exist) {
			return new Response('already exists', {
				status: 409,
			});
		}

		const accessToken = c.var.spApiAccessToken;
		// レポートapi
		const api = createApi<inventoryPaths>(accessToken);
		console.log('get inventory summaries...');
		const inventorySummaries =
			await getAllInventorySummariesUntilRateLimit(api);
		if (inventorySummaries.isErr()) {
			return new Response('get settlement reports was failed', {
				status: 500,
			});
		}
		console.log('inventory summaries:', inventorySummaries.value.length);

		const putResult = await gzipAndPutFile(
			userId,
			FILE_NAMES.INVENTORY_SUMMARIES,
			inventorySummaries.value,
		);

		if (!putResult) {
			return new Response('put file was failed', {
				status: 500,
			});
		}
		return new Response('ok', {
			status: 200,
		});
	});

function createApi<T extends object>(accessToken: string) {
	// レポートapi
	const api = createApiClient<T>({
		baseUrl: SP_SELLER_KANRIKUN_BASE_URL,
	});
	const middleware: Middleware = {
		async onRequest({ request }) {
			// リクエストにアクセストークンを追加
			request.headers.set('x-amz-access-token', accessToken);
			return request;
		},
	};
	api.use(middleware);
	return api;
}
