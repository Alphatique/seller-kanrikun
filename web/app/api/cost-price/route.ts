import { z } from 'zod';

import {
	CostPriceSchema,
	type CostPriceTsv,
} from '@seller-kanrikun/calc/types/cost';

import {
	tsvGzipToTsvObj,
	tsvObjToTsvGzip,
} from '@seller-kanrikun/calc/tsv-gzip';
import { getApi, getReadOnlySignedUrl, putApi } from '../r2';

const UploadCostPriceSchema = z.object({
	start: z.coerce.date(),
	end: z.coerce.date(),
	values: z.array(CostPriceSchema),
});
const fileName = 'cost-price.tsv.gz';
export async function GET(request: Request): Promise<Response> {
	return getApi(request, fileName);
}

export async function POST(request: Request): Promise<Response> {
	return putApi(request, fileName, async userId => {
		const requestJson = await request.json();
		const requestParse = UploadCostPriceSchema.safeParse(requestJson);

		console.log(requestParse.data);
		if (!requestParse.success) return null;
		if (requestParse.data.values.length === 0) return null;
		const reqStart = requestParse.data.start.getTime();
		const reqEnd = requestParse.data.end.getTime();
		if (reqStart >= reqEnd) return null;

		const url = await getReadOnlySignedUrl(userId, fileName);
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
}
