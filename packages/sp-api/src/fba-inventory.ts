import { Result } from 'neverthrow';
import type { Client } from 'openapi-fetch';

import { getFile } from '@seller-kanrikun/data-operation/r2';

import type { components, paths } from '../schema/fba-inventory';
import { JAPAN_MARKET_PLACE_ID } from './constants';
import { waitRateLimitTime } from './utils';

async function saveInventorySummaries<Data, Error>(
	bucketName: string,
	fileName: string,
	userId: string,
	newData: components['schemas']['InventorySummary'][],
) {
	const existData = await getFile(
		bucketName,
		userId,
		'inventory-summary.tsv.gz',
	);
}

async function getMultiInventorySummaries<Data, Error>(
	api: Client<paths>,
	loopWaitFunc?: (response: Response) => Promise<void>,
): Promise<Record<string, string>[]> {
	let nextToken: string | undefined = undefined;
	const allSummaries: components['schemas']['InventorySummaries'][] = [];

	// nextTokenがある限りnextTokenを使って続けて取得
	const maxLoopCount = 500;
	let loopCount = 0;
	while (true) {
		const result = await getInventorySummaries(api, nextToken);
		const summaries = result?.data?.payload?.inventorySummaries;
		nextToken = result.data?.pagination?.nextToken;

		if (summaries) {
			allSummaries.push(summaries);
		}
		if (nextToken === undefined) {
			// nextTokenがない場合はループを抜ける
			break;
		}

		// ループ回数が制限を超えた場合はエラーを出力
		loopCount++;
		if (loopCount >= maxLoopCount) {
			console.error(
				'getInventorySummariesWithRateLimit: loop limit exceeded',
			);
			break;
		}

		if (loopWaitFunc) {
			// レート制限分待機
			await loopWaitFunc(result.response);
		}
	}

	// レコードにしたものを返す
	return multiSummariesToStrRecord(allSummaries);
}

// 複数のinventorySummariesをRecordに変換
function multiSummariesToStrRecord(
	multiSummaries: components['schemas']['InventorySummaries'][],
): Record<string, string>[] {
	const result: Record<string, string>[] = [];

	// summariesを一つのデータとする
	for (const summaries of multiSummaries) {
		for (const [key, value] of Object.entries(summaries)) {
			if (value === null) continue;
			result.push({
				[key]: value as string,
			});
		}
	}

	return result;
}

interface fetchReturn<Data, Error> {
	response: Response;
	data?: Data;
	error?: Error;
}

// 一覧の取得
async function getInventorySummaries(
	api: Client<paths>,
	nextToken: string | undefined = undefined,
) {
	return await api.GET('/fba/inventory/v1/summaries', {
		params: {
			query: {
				granularityType: 'Marketplace' as const,
				granularityId: JAPAN_MARKET_PLACE_ID,
				marketplaceIds: [JAPAN_MARKET_PLACE_ID],
				// nextTokenがある場合nextTokenを追加
				...(nextToken ? { nextToken } : {}),
			},
		},
	});
}
