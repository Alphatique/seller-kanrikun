import type { CostPriceTsv } from '@seller-kanrikun/data-operation/types/cost';

import { tsvObjToTsvGzip } from '@seller-kanrikun/data-operation/tsv-gzip';
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
		const tsvArray = tsvObjToTsvGzip(emptyCostPrice);

		const response = await fetch(url, {
			method: 'PUT',
			body: tsvArray,
		});

		if (!response.ok) {
			return new Response('failed to upload', {
				status: 500,
			});
		}
		return new Response('ok');
	} else {
		return new Response('file already exists', {
			status: 403,
		});
	}
}
