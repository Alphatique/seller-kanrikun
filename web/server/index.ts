import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { auth } from '@seller-kanrikun/auth/server';
import {
	tsvGzipToTsvObj,
	tsvObjToTsvGzip,
} from '@seller-kanrikun/data-operation/tsv-gzip';
import type { CostPriceTsv } from '@seller-kanrikun/data-operation/types/cost';

import {
	catalogItemsFileName,
	costPriceFileName,
	doesFileExist,
	getApi,
	getReadOnlySignedUrl,
	getWriteOnlySignedUrl,
	inventorySummariesFileName,
	putApi,
	salesTrafficReportFileName,
	settlementReportFileName,
} from '~/lib/r2';
import { uploadCostPriceSchema } from '~/schema/const-price';

import { app as linkAccount } from './link-account';
import { authMiddleware } from './middleware';

export const app = new Hono().basePath('/api');

const route = app
	.use(logger(text => console.log(`[API] ${text}`)))
	.get('/status', async c => {
		return c.json({ status: 'ok' });
	})
	.on(['POST', 'GET'], '/auth/*', c => {
		return auth.handler(c.req.raw);
	})
	.route('/link-account', linkAccount)
	.get(
		'/:slug{reports/settlement|reports/sales-traffic|cost-price|inventory|catalog}',
		authMiddleware,
		async c => {
			const slug = c.req.param('slug');
			console.log({ slug });

			const fileName = {
				'reports/settlement': settlementReportFileName,
				'reports/sales-traffic': salesTrafficReportFileName,
				'cost-price': costPriceFileName,
				inventory: inventorySummariesFileName,
				catalog: catalogItemsFileName,
			}[slug];
			if (!fileName) throw new Error();

			return await getApi(c.req.raw, fileName);
		},
	)
	.post('/cost-price', authMiddleware, async c => {
		return await putApi(c.req.raw, costPriceFileName, async userId => {
			const requestJson = await c.req.raw.json();
			const requestParse = uploadCostPriceSchema.safeParse(requestJson);

			if (!requestParse.success) return null;
			if (requestParse.data.values.length === 0) return null;
			const reqStart = requestParse.data.start.getTime();
			const reqEnd = requestParse.data.end.getTime();
			if (reqStart >= reqEnd) return null;

			const url = await getReadOnlySignedUrl(userId, costPriceFileName);
			const fileResponse = await fetch(url);
			if (!fileResponse.ok) return null;
			const existArray = await fileResponse.arrayBuffer();
			const existData = tsvGzipToTsvObj<CostPriceTsv>(
				new Uint8Array(existArray),
			);

			const resultArray: CostPriceTsv[] = [];

			for (const row of existData.data) {
				const rowStart = new Date(row.startDate).getTime();
				const rowEnd = new Date(row.endDate).getTime();

				if (rowEnd <= reqStart || rowStart >= reqEnd) {
					resultArray.push(row);
				} else {
					if (rowStart < reqStart) {
						resultArray.push({
							asin: row.asin,
							startDate: row.startDate,
							endDate: requestParse.data.start,
							price: row.price,
						});
					}
					if (rowEnd > reqEnd) {
						resultArray.push({
							asin: row.asin,
							startDate: requestParse.data.end,
							endDate: row.endDate,
							price: row.price,
						});
					}
				}
			}

			for (const row of requestParse.data.values) {
				resultArray.push({
					asin: row.ASIN,
					startDate: requestParse.data.start,
					endDate: requestParse.data.end,
					price: row.Price,
				});
			}

			// ASIN, 価格, 開始日時でソート
			resultArray.sort((a, b) => {
				if (a.asin !== b.asin) return a.asin.localeCompare(b.asin);
				if (a.price !== b.price) return a.price - b.price;
				return (
					new Date(a.startDate).getTime() -
					new Date(b.startDate).getTime()
				);
			});

			const mergedArray: CostPriceTsv[] = [];

			for (const current of resultArray) {
				const last = mergedArray[mergedArray.length - 1];
				if (
					last &&
					last.asin === current.asin &&
					last.price === current.price &&
					// オーバーラップまたは連続しているかチェック
					last.endDate >= current.startDate
				) {
					// マージ: 終了日を最大の方へ拡張
					if (current.endDate > last.endDate) {
						last.endDate = current.endDate;
					}
				} else {
					// 新規として追加
					mergedArray.push({ ...current });
				}
			}

			console.log(mergedArray);

			const resultTsv = tsvObjToTsvGzip(mergedArray);

			return resultTsv.slice().buffer;
		});
	})
	.post('/first', authMiddleware, async c => {
		const session = c.var.session;

		const hasFile = await doesFileExist(session.user.id, costPriceFileName);
		if (!hasFile) {
			const url = await getWriteOnlySignedUrl(
				session.user.id,
				costPriceFileName,
			);
			const emptyCostPrice: CostPriceTsv[] = [];
			// papaparseの無駄遣い
			const tsvArray = tsvObjToTsvGzip(emptyCostPrice);

			const response = await fetch(url, {
				method: 'PUT',
				body: tsvArray,
			});

			if (!response.ok)
				return c.json(
					{
						error: 'failed to upload',
					},
					500,
				);

			return c.json({});
		} else {
			return c.json(
				{
					error: 'file already exists',
				},
				403,
			);
		}
	});

export type RouteType = typeof route;
