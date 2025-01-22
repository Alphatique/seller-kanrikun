import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { addSeconds, isBefore } from 'date-fns';
import { Hono } from 'hono';
import createApiClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import Papa from 'papaparse';

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
	accessTokenMiddleware,
	authMiddleware,
	dbMiddleware,
} from './middleware';

export const app = new Hono()
	.use(authMiddleware)
	.use(dbMiddleware)
	.get('/settlement-report', accessTokenMiddleware, async c => {
		const accessToken = c.var.spApiAccessToken;

		// レポートapi
		const reportsApi = createApiClient<reportsPaths>({
			baseUrl: SELLER_API_BASE_URL,
		});

		const tokenMiddleware: Middleware = {
			async onRequest({ request, options }) {
				// リクエストにアクセストークンを追加
				request.headers.set('x-amz-access-token', accessToken);
				return request;
			},
		};
		reportsApi.use(tokenMiddleware);

		const settlementReports = await getAllSettlementReportsRetryRateLimit(
			reportsApi,
			[],
		);

		const settlementReportDocuments =
			await getSettlementReportsDocumentRetryRateLimit(
				reportsApi,
				settlementReports,
			);
		await writeFile(
			'./settlementReportDocuments.json',
			JSON.stringify(settlementReportDocuments, null, 2),
			'utf8',
		);
		return new Response('ok', {
			status: 200,
		});
	});
