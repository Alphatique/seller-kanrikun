import { Hono } from 'hono';

import {
	tsvGzipToTsvObj,
	tsvObjToTsvGzip,
} from '@seller-kanrikun/data-operation/tsv-gzip';
import type { CostPriceTsv } from '@seller-kanrikun/data-operation/types/cost';

import { FILE_NAMES } from '~/lib/constants';
import { putApi } from '~/lib/r2';
import { getReadOnlySignedUrl } from '~/lib/r2';
import { uploadCostPriceSchema } from '~/schema/const-price';
import { authMiddleware } from './middleware';

export const app = new Hono().use(authMiddleware).post('/', async c => {
	console.log('cost-price');
	/*
    return await putApi(c.req.raw, FILE_NAMES.COST_PRICE, async userId => {
		const requestJson = await c.req.raw.json();
		const requestParse = uploadCostPriceSchema.safeParse(requestJson);

		if (!requestParse.success) return null;
		if (requestParse.data.values.length === 0) return null;
		const reqStart = requestParse.data.start.getTime();
		const reqEnd = requestParse.data.end.getTime();
		if (reqStart >= reqEnd) return null;

		const url = await getReadOnlySignedUrl(userId, FILE_NAMES.COST_PRICE);
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
    */

	return c.json({ status: 'ok' });
});
