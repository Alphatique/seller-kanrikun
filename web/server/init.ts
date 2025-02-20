import { waitUntil } from '@vercel/functions';
import { Hono } from 'hono';
import type { Middleware } from 'openapi-fetch';
import createApiClient from 'openapi-fetch';

import { startOfDay, subDays, subWeeks } from 'date-fns';

import { getAllInventorySummariesUntilRateLimit } from '@seller-kanrikun/api-wrapper/inventory';
import {
	createAllSalesTrafficReportsUntilRateLimit,
	getAllCreatedReportDocumentIdsRetryRateLimit,
	getAllSalesTrafficReportDocumentUntilRateLimit,
} from '@seller-kanrikun/api-wrapper/sales-traffic-report';
import {
	getAllSettlementReportsUntilRateLimit,
	getSettlementReportsDocumentUntilRateLimit,
} from '@seller-kanrikun/api-wrapper/settlement-report';
import { existFile } from '@seller-kanrikun/data-operation/r2';
import type { paths as inventoryPaths } from '@seller-kanrikun/sp-api/schema/fba-inventory';
import type { paths as reportsPaths } from '@seller-kanrikun/sp-api/schema/reports';

import { FILE_NAMES, SP_SELLER_KANRIKUN_BASE_URL } from '~/lib/constants';
import { gzipAndPutFile } from '~/lib/fetch-gzip';

import {
	accessTokenMiddleware,
	authMiddleware,
	dbMiddleware,
} from './middleware';

const salesTrafficReportLimit = 7;
const settlementReportLimit = 15 - salesTrafficReportLimit;

export const app = new Hono()
	.use(dbMiddleware)
	.use(authMiddleware)
	.use(accessTokenMiddleware)
	.get('/', async c => {
		// TODO: postにすべき説
		const urls = [
			'/api/init/settlement-report',
			'/api/init/sales-traffic-report',
			'/api/init/inventory-summaries',
			'/api/init/cost-price',
		];

		console.log('initializing...');
		const promises = urls.map(async url => {
			await fetch(`${process.env.SELLER_KANRIKUN_BASE_URL}${url}`, {
				headers: c.req.raw.headers,
			});
		});
		await Promise.all(promises);
		return c.text('finish');
	})
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

		return c.text('ok');
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

		// 新しいデータ順
		const sortedReports = reports.value.sort(
			(a, b) =>
				new Date(b.dataEndTime).getTime() -
				new Date(a.dataEndTime).getTime(),
		);
		let limitedReports = sortedReports;

		// sales-traffic分余裕を持たせる
		const reportsLimit = settlementReportLimit;
		if (reports.value.length > settlementReportLimit) {
			limitedReports = limitedReports.slice(0, reportsLimit);
		}
		console.log('settlement report:', reports.value.length);
		console.log('get settlement report document...');
		const reportResult = await getSettlementReportsDocumentUntilRateLimit(
			api,
			limitedReports,
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
			console.error('An error occurred while putting report document');
			return new Response(
				'An error occurred while putting report document',
				{
					status: 500,
				},
			);
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
						'An error occurred while getting report document IDs:',
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
						'An error occurred while getting report document:',
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
					console.error(
						'An error occurred while putting report document',
					);
					return;
				}

				console.log('Successfully put sales traffic report document');
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
			return new Response('Inventory summaries already exists', {
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
			return new Response('Failed to get inventory summaries', {
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
			return new Response('Failed to put inventory summaries', {
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
