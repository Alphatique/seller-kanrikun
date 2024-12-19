import { gzipSync } from 'fflate';
import Papa from 'papaparse';

import type { CostPriceTsv } from '@seller-kanrikun/calc/types/cost';

import { authorizeSession, doesFileExist, getWriteOnlySignedUrl } from '../r2';

export async function POST(request: Request): Promise<Response> {
	const auth = await authorizeSession(request);

	if (auth instanceof Response) {
		return auth;
	}

	const costFileName = 'cost-price.tsv.gz';
	const hasFile = await doesFileExist(auth, costFileName);
	if (!hasFile) {
		const url = await getWriteOnlySignedUrl(auth, costFileName);
		const emptyCostPrice: CostPriceTsv[] = [];
		// papaparseの無駄遣い
		const tsvStr = Papa.unparse(emptyCostPrice, {
			delimiter: '\t',
			header: true,
		});

		const encoder = new TextEncoder();
		const tsvUint8 = encoder.encode(tsvStr);

		const gzippedData = gzipSync(tsvUint8);

		const response = await fetch(url, {
			method: 'PUT',
			body: gzippedData,
		});
	}

	return new Response('ok');
}
