import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate';
import { Err, Ok, type Result } from 'neverthrow';
import type { Client } from 'openapi-fetch';

import { getFile, putFile } from '@seller-kanrikun/data-operation/r2';
import type {
	components,
	operations,
	paths,
} from '@seller-kanrikun/sp-api/schema/fba-inventory';

import {
	type InventorySummaries,
	type InventorySummary,
	inventorySummaries,
	inventorySummary,
} from '../schema/inventory';
import { JAPAN_MARKET_PLACE_ID } from './constants';
import type { ValueOf } from './utils';

async function saveInventorySummaries<Data, Error>(
	bucketName: string,
	fileName: string,
	userId: string,
	newData: InventorySummaries,
) {
	const existResponse = await getFile(bucketName, userId, fileName);
	const existByteArray = await existResponse?.Body?.transformToByteArray();
	if (existByteArray === undefined) return;
	const unzipped = gunzipSync(existByteArray);
	const existText = strFromU8(unzipped);
	const existData = inventorySummaries.parse(JSON.parse(existText));

	const response = [...existData, ...newData];

	const responseText = response.toString();
	const responseByteArray = strToU8(responseText);
	const gzip = gzipSync(responseByteArray);

	return await putFile(bucketName, userId, fileName, gzip);
}

type responseValues = ValueOf<operations['getInventorySummaries']['responses']>;

async function getMultiInventorySummaries(
	api: Client<paths>,
	nextToken?: string,
): Promise<Result<InventorySummaries, [Error, InventorySummaries]>> {
	// 事前に定義
	let currentNextToken = nextToken;
	const allSummaries: components['schemas']['InventorySummaries'][] = [];

	// nextTokenがある限りnextTokenを使って続けて取得
	const maxLoopCount = 500;
	let loopCount = 0;
	while (true) {
		// 取得
		const { data, error, response } = await getInventorySummaries(
			api,
			nextToken,
		);
		const summaries = data?.payload?.inventorySummaries;
		currentNextToken = data?.pagination?.nextToken;

		if (summaries) {
			// 追加
			allSummaries.push(summaries);
		} else {
			/*
			return new Err([
				error?.errors,
				apiSummariesToSchemaSummaries(allSummaries),
			]);*/
		}
		if (currentNextToken === undefined) {
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
	}

	return new Ok(apiSummariesToSchemaSummaries(allSummaries));
}

// 取得したデータをschemaで変換
function apiSummariesToSchemaSummaries(
	multiSummaries: components['schemas']['InventorySummaries'][],
): InventorySummaries {
	const response: InventorySummaries = [];
	for (const summary of multiSummaries) {
		response.push(
			inventorySummary.parse({
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
