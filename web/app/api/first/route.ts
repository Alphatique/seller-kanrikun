import type { CostPriceTsv } from '@seller-kanrikun/data-operation/types/cost';

import { auth } from '@seller-kanrikun/auth/server';
import { tsvObjToTsvGzip } from '@seller-kanrikun/data-operation/tsv-gzip';

import {
	costPriceFileName,
	doesFileExist,
	getWriteOnlySignedUrl,
	returnUnauthorized,
} from '~/lib/r2';

export async function POST(request: Request): Promise<Response> {
	const session = await auth.api.getSession(request);
	if (!session) return returnUnauthorized();

	if (auth instanceof Response) {
		return auth;
	}

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
