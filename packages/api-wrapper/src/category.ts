import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate';
import { Err, Ok, type Result, err } from 'neverthrow';
import type { Client } from 'openapi-fetch';
import { saveCombineData } from './utils';

import { getFile, putFile } from '@seller-kanrikun/data-operation/r2';
import type {
	components,
	operations,
	paths,
} from '@seller-kanrikun/sp-api/schema/catalog-items';

import {
	type CatalogSummaries,
	type CatalogSummary,
	catalogSummaries,
	catalogSummary,
} from '../schema/catalog';
import { JAPAN_MARKET_PLACE_ID } from './constants';
import { type ValueOf, waitRateLimitTime } from './utils';

export async function getAllCatalogSummariesRetryRateLimit(
	api: Client<paths>,
	asins: string[],
): Promise<CatalogSummaries> {
	const allSummaries: components['schemas']['ItemSummaries'] = [];

	// nextTokenがある限りnextTokenを使って続けて取得
	for (let i = 0; i < asins.length; i++) {
		// 取得
		const { data, error, response } = await getCatalogSummaries(
			api,
			asins[i],
		);
		const summaries = data?.summaries;

		if (summaries) {
			// 追加
			allSummaries.concat(summaries);
		}
		if (error) {
			if (response.status === 200) {
				await waitRateLimitTime(response, 60);
			} else {
				console.error(error, response);
				break;
			}
		}
	}

	return apiSummariesToSchemaSummaries(allSummaries);
}

export async function getAllCatalogSummariesUntilRateLimit(
	api: Client<paths>,
	asins: string[],
): Promise<CatalogSummaries> {
	const allSummaries: components['schemas']['ItemSummaries'] = [];

	// nextTokenがある限りnextTokenを使って続けて取得
	for (let i = 0; i < asins.length; i++) {
		// 取得
		const { data, error, response } = await getCatalogSummaries(
			api,
			asins[i],
		);
		const summaries = data?.summaries;

		if (summaries) {
			// 追加
			allSummaries.concat(summaries);
		} else {
			if (response.status === 429) {
				// 429出なければエラー
				console.error(error, response);
			}
			break;
		}
	}

	return apiSummariesToSchemaSummaries(allSummaries);
}

// 取得したデータをschemaで変換
function apiSummariesToSchemaSummaries(
	multiSummaries: components['schemas']['ItemSummaries'],
): CatalogSummaries {
	const response: CatalogSummaries = [];
	for (const summary of multiSummaries) {
		response.push(
			catalogSummary.parse({
				...summary,
				sellerKanrikunSavedTime: new Date(),
			}),
		);
	}
	return response;
}

interface fetchReturn<Data, Error> {
	response: Response;
	data?: Data;
	error?: Error;
}

// 一覧の取得
async function getCatalogSummaries(api: Client<paths>, asin: string) {
	return await api.GET('/catalog/2022-04-01/items/{asin}', {
		params: {
			path: {
				asin: asin,
			},
			query: {
				marketplaceIds: [JAPAN_MARKET_PLACE_ID],
			},
		},
	});
}
