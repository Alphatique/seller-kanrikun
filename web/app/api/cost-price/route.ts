import { gunzipSync } from 'fflate';
import Papa from 'papaparse';
import { z } from 'zod';

import {
	CostPriceSchema,
	type CostPriceTsv,
} from '@seller-kanrikun/calc/types/cost';

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
		const data = await request.json();
		const requestParse = UploadCostPriceSchema.safeParse(data);

		if (requestParse.success) {
			const url = await getReadOnlySignedUrl(userId, fileName);
			const fileResponse = await fetch(url);
			if (fileResponse.ok) {
				const data = await fileResponse.arrayBuffer();
				const uint8Array = new Uint8Array(data);
				const decompressed = gunzipSync(uint8Array);
				const decoder = new TextDecoder();
				const tsvText: string = decoder.decode(decompressed);
				const tsvData = tsvText.trim();
				console.log('parcing...');
				const existDataParse = Papa.parse<CostPriceTsv[]>(tsvData, {
					header: true,
					delimiter: '\t',
					skipEmptyLines: true,
				});

				console.log(existDataParse);

				for (const row of existDataParse.data) {
					console.log(row);
				}
			}

			return null;
		}
		return null;
	});
}
