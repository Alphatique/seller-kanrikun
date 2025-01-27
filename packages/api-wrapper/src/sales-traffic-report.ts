import {
	addWeeks,
	addYears,
	endOfWeek,
	isAfter,
	isBefore,
	max,
	min,
	startOfWeek,
	subDays,
	subWeeks,
	subYears,
} from 'date-fns';
import { gunzipSync } from 'fflate';
import { Err, Ok, type Result, err } from 'neverthrow';
import type { Client } from 'openapi-fetch';
import Papa from 'papaparse';

import type { Account } from '@seller-kanrikun/db/schema';
import type { paths } from '@seller-kanrikun/sp-api/schema/reports';

import {
	type SalesAndTrafficReportDocument,
	type SalesAndTrafficReportDocumentRow,
	salesTrafficReportDocument,
} from '../schema/sales-traffic-report';
import { JAPAN_MARKET_PLACE_ID } from './constants';
import { type ValueOf, waitRateLimitTime } from './utils';

export async function getAllSalesTrafficReportsRetryRateLimit(
	api: Client<paths>,
	start: Date,
	end: Date,
): Promise<Result<string[], undefined>> {
	let current = start;
	const reportIds: string[] = [];
	while (true) {
		// 一日前
		const last = subDays(current, 1);
		const { data, error, response } = await createSalesTrafficReport(
			api,
			last,
			current,
		);
		if (data?.reportId) {
			reportIds.push(data.reportId);
		} else {
			if (response.status === 429) {
				// レートリミットなら2分待ってリトライ
				console.warn(error, response);
				await new Promise(resolve => setTimeout(resolve, 120 * 1000));
			} else {
				console.error(data, error, response);
				return new Err(undefined);
			}
		}

		// 現在を更新
		current = last;
		// 終了日を超えたら終了
		if (isBefore(current, end)) {
			break;
		}

		await waitRateLimitTime(response, 60);
	}

	return new Ok(reportIds);
}

export async function createAllSalesTrafficReportsUntilRateLimit(
	api: Client<paths>,
	start: Date,
	end: Date,
): Promise<Result<string[], undefined>> {
	let current = start;

	const reportIds: string[] = [];
	while (true) {
		// 土曜
		const last = subDays(current, 1);
		const { data, error, response } = await createSalesTrafficReport(
			api,
			last,
			current,
		);
		if (data?.reportId) {
			reportIds.push(data.reportId);
		} else {
			// データがなくなれば終了
			if (response.status !== 429) {
				// 429じゃなければエラー
				return new Err(undefined);
			}
			break;
		}

		// 現在を更新
		current = last;
		if (isBefore(current, end)) {
			// 終了日を超えたら終了
			break;
		}
	}

	return new Ok(reportIds);
}

export async function getAllCreatedReportDocumentIdsRetryRateLimit(
	api: Client<paths>,
	reportIds: string[],
): Promise<Result<string[], undefined>> {
	const result = [];
	const maxLoopCount = 500;
	for (const reportId of reportIds) {
		let loopCount = 0;
		while (true) {
			const { data, error, response } = await getCreatedReport(
				api,
				reportId,
			);

			const status = data?.processingStatus;
			if (status) {
				if (status === 'DONE') {
					const reportDocumentId = data.reportDocumentId;
					if (reportDocumentId) {
						result.push(reportDocumentId);
					}
					break;
				} else if (status === 'FATAL') {
					console.error(data, response);
					break;
				} else if (status === 'CANCELLED') {
					break;
				}
			} else {
				if (response.status !== 429) {
					return new Err(undefined);
				}
				await new Promise(resolve => setTimeout(resolve, 30 * 1000));
			}

			// ループ回数が制限を超えた場合はエラーを出力
			loopCount++;
			if (loopCount >= maxLoopCount) {
				console.error(
					'getInventorySummariesWithRateLimit: loop limit exceeded',
				);
				break;
			}

			await waitRateLimitTime(response, 0.5);
		}
	}

	return new Ok(result);
}

export async function getSalesTrafficReportDocumentRetryRateLimit(
	api: Client<paths>,
	reportDocumentId: string,
	rateLimitWaitTime: number,
): Promise<Result<SalesAndTrafficReportDocument, Response>> {
	const result: SalesAndTrafficReportDocument = [];

	const documentResult = await getReportDocument(api, reportDocumentId);

	if (!documentResult.isOk()) {
		if (documentResult.error.status === 429) {
			// レートリミットならリトライ
			console.warn(documentResult);
			await new Promise(resolve =>
				setTimeout(resolve, rateLimitWaitTime),
			);
			return getSalesTrafficReportDocumentRetryRateLimit(
				api,
				reportDocumentId,
				rateLimitWaitTime,
			);
		} else {
			// 429じゃなければエラー
			return new Err(documentResult.error);
		}
	}

	const response = documentResult.value;

	const gzipData = await response.arrayBuffer();
	const decompressed = gunzipSync(new Uint8Array(gzipData));
	const decoder = new TextDecoder();
	const jsonStr = decoder.decode(decompressed);
	const json = JSON.parse(jsonStr);

	const parsedData = salesTrafficReportDocument.parse(json);

	const dateMetaData = {
		dataStartTime: parsedData.reportSpecification.dataStartTime,
		dataEndTime: parsedData.reportSpecification.dataEndTime,
		sellerKanrikunSaveTime: new Date(),
	};
	for (const eachAsinData of parsedData.salesAndTrafficByAsin) {
		const salesByAsin = {
			unitsOrdered: eachAsinData.salesByAsin.unitsOrdered,
			orderedProductSalesAmount:
				eachAsinData.salesByAsin.orderedProductSales.amount,
			orderedProductSalesCurrencyCode:
				eachAsinData.salesByAsin.orderedProductSales.currencyCode,
		};
		result.push({
			parentAsin: eachAsinData.parentAsin,
			childAsin: eachAsinData.childAsin,
			...eachAsinData.trafficByAsin,
			...salesByAsin,
			...dateMetaData,
		});
	}

	return new Ok(result);
}
export async function getAllSalesTrafficReportDocumentRetryRateLimit(
	api: Client<paths>,
	reportDocumentIds: string[],
	rateLimitWaitTime: number,
): Promise<Result<SalesAndTrafficReportDocument, undefined>> {
	const result: SalesAndTrafficReportDocument = [];

	for (const reportDocumentId in reportDocumentIds) {
		const reportDocument =
			await getSalesTrafficReportDocumentRetryRateLimit(
				api,
				reportDocumentId,
				rateLimitWaitTime,
			);
		if (reportDocument.isOk()) {
			result.push(...reportDocument.value);
		} else {
			break;
		}
	}

	return new Ok(result);
}

export async function createSalesTrafficReport(
	api: Client<paths>,
	start: Date,
	end: Date,
) {
	return api.POST('/reports/2021-06-30/reports', {
		body: {
			reportType: 'GET_SALES_AND_TRAFFIC_REPORT',
			marketplaceIds: [JAPAN_MARKET_PLACE_ID],
			reportOptions: {
				asinGranularity: 'CHILD',
			},
			dataStartTime: start.toISOString(),
			dataEndTime: end.toISOString(),
		},
	});
}

export async function createSalesTrafficReportRetryRateLimit(
	api: Client<paths>,
	start: Date,
	end: Date,
	rateLimitWaitTime: number,
): Promise<Result<string, undefined>> {
	const { data, error, response } = await createSalesTrafficReport(
		api,
		start,
		end,
	);

	const reportId = data?.reportId;
	if (reportId) {
		return new Ok(reportId);
	}

	// reportIdがない場合
	if (response.status === 429) {
		// レートリミットなら2分待ってリトライ
		console.warn(error, response);
		await new Promise(resolve => setTimeout(resolve, rateLimitWaitTime));
		return createSalesTrafficReportRetryRateLimit(
			api,
			start,
			end,
			rateLimitWaitTime,
		);
	} else {
		// 429じゃなければエラー
		console.error(data, error, response);
		return new Err(undefined);
	}
}

export async function getCreatedReport(api: Client<paths>, reportId: string) {
	return api.GET('/reports/2021-06-30/reports/{reportId}', {
		params: {
			path: {
				reportId,
			},
		},
	});
}

export async function getCreatedReportDocumentIdRetryRateLimit(
	api: Client<paths>,
	reportId: string,
	rateLimitWaitTime: number,
	retryWaitTime: number,
): Promise<string | null> {
	const { data, error, response } = await getCreatedReport(api, reportId);

	const status = data?.processingStatus;
	if (status) {
		if (status === 'DONE') {
			const reportDocumentId = data.reportDocumentId;
			if (reportDocumentId) {
				return reportDocumentId;
			} else {
				console.error('reportDocumentId was undefined');
				return null;
			}
		} else if (status === 'FATAL') {
			console.error(data, response);
			return null;
		} else if (status === 'CANCELLED') {
			console.warn('create report was canceled');
			return null;
		}
		await new Promise(resolve => setTimeout(resolve, retryWaitTime));

		return getCreatedReportDocumentIdRetryRateLimit(
			api,
			reportId,
			rateLimitWaitTime,
			retryWaitTime,
		);
	}
	if (response.status === 429) {
		console.warn(error, response);
		await new Promise(resolve => setTimeout(resolve, rateLimitWaitTime));

		return getCreatedReportDocumentIdRetryRateLimit(
			api,
			reportId,
			rateLimitWaitTime,
			retryWaitTime,
		);
	}
	console.error(data, error, response);
	return null;
}

async function getReportDocument(
	api: Client<paths>,
	reportDocumentId: string,
): Promise<Result<Response, Response>> {
	const { data, error, response } = await api.GET(
		'/reports/2021-06-30/documents/{reportDocumentId}',
		{
			params: {
				path: {
					reportDocumentId,
				},
			},
		},
	);

	const url = data?.url;
	const compressionAlgorithm = data?.compressionAlgorithm;
	if (url && compressionAlgorithm) {
		if (compressionAlgorithm === 'GZIP') {
			return new Ok(await fetch(url));
		} else {
			console.error(
				'sales-traffic-report-document was not GZIP',
				compressionAlgorithm,
			);
			return new Err(response);
		}
	} else {
		return new Err(response);
	}
}
