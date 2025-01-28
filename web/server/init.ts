import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
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
	getAllSalesTrafficReportsRetryRateLimit,
	getCreatedReport,
	getCreatedReportDocumentIdRetryRateLimit,
	getSalesTrafficReportDocumentRetryRateLimit,
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
import type { paths as catalogPaths } from '@seller-kanrikun/sp-api/schema/catalog-items';
import type { paths as inventoryPaths } from '@seller-kanrikun/sp-api/schema/fba-inventory';
import type { paths as reportsPaths } from '@seller-kanrikun/sp-api/schema/reports';

import {
	FILE_NAMES,
	JAPAN_MARKET_PLACE_ID,
	R2_BUCKET_NAME,
	SP_API_BASE_URL,
} from '~/lib/constants';

import { gzipAndPutFile } from '~/lib/fetch-gzip';
import { getSpApiAccessTokenAndExpiresAt } from '~/lib/token';

import type { User } from '@seller-kanrikun/db/schema';
import {
	accessTokenMiddleware,
	authMiddleware,
	cronAuthMiddleware,
	dbMiddleware,
	userHeaderMiddleware,
} from './middleware';

const appBase = new Hono<{
	Variables: {
		user: User;
		spApiAccessToken: string;
	};
}>()
	.get('/settlement-report', async c => {
		const userId = c.var.user.id;
		// メタファイルがなければとする
		const exist = await existFile(
			R2_BUCKET_NAME,
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
		const reportDocument = await filterSettlementReportDocument(
			[],
			reportResult.value,
		);
		console.log(
			'filtered settlement report document:',
			reportDocument.length,
		);

		const documentPutResult = await gzipAndPutFile(
			userId,
			FILE_NAMES.SETTLEMENT_REPORT_DOCUMENT,
			reportDocument,
		);
		if (!documentPutResult) {
			return new Response('failed to put settlement report document', {
				status: 500,
			});
		}
		const metaPutResult = await gzipAndPutFile(
			userId,
			FILE_NAMES.SETTLEMENT_REPORT_META,
			reportResult.value.map(row => row.report),
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
		const exist = await existFile(
			R2_BUCKET_NAME,
			userId,
			FILE_NAMES.SALES_TRAFFIC_REPORT,
		);
		if (exist) {
			return new Response('already exists', {
				status: 409,
			});
		}
		const accessToken = c.var.spApiAccessToken;
		const api = createApi<reportsPaths>(accessToken);
		console.log('create sales traffic reports...');
		const reportIds = await createAllSalesTrafficReportsUntilRateLimit(
			api,
			subDays(new Date(), 1),
			subWeeks(new Date(), 2),
		);
		if (reportIds.isErr()) {
			return new Response('failed to create sales traffic report', {
				status: 500,
			});
		}
		console.log('sales traffic reports:', reportIds);
		console.log('get created sales traffic reports...');
		const reportDocumentIds =
			await getAllCreatedReportDocumentIdsRetryRateLimit(
				api,
				reportIds.value,
			);
		if (reportDocumentIds.isErr()) {
			return new Response('failed to get created sales traffic report', {
				status: 500,
			});
		}
		console.log(
			'sales traffic report documet ids:',
			reportDocumentIds.value,
		);
		console.log('get sales traffic report document...');
		const reportDocument =
			await getAllSalesTrafficReportDocumentRetryRateLimit(
				api,
				reportDocumentIds.value,
				120 * 1000,
			);
		if (reportDocument.isErr()) {
			return new Response('failed to get sales traffic report document', {
				status: 500,
			});
		}
		console.log(
			'sales traffic report document length',
			reportDocument.value.length,
		);
		const putResult = await gzipAndPutFile(
			userId,
			FILE_NAMES.SALES_TRAFFIC_REPORT,
			reportDocument.value,
		);
		if (!putResult) {
			return new Response('put file was failed', {
				status: 500,
			});
		}
		return new Response('ok', {
			status: 200,
		});
	})
	.get('/inventory-summaries', async c => {
		const userId = c.var.user.id;

		const exist = await existFile(
			R2_BUCKET_NAME,
			userId,
			FILE_NAMES.INVENTORY_SUMMARIES,
		);
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

export const cronApp = new Hono().use(userHeaderMiddleware).route('/', appBase);

export const apiApp = new Hono()
	.use(dbMiddleware)
	.use(authMiddleware)
	.use(accessTokenMiddleware)
	.route('/', appBase);

function createApi<T extends object>(accessToken: string) {
	// レポートapi
	const api = createApiClient<T>({
		baseUrl: SP_API_BASE_URL,
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
