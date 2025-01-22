import { Err, Ok, type Result, err } from 'neverthrow';
import type { Client } from 'openapi-fetch';
import Papa from 'papaparse';

import type { paths } from '@seller-kanrikun/sp-api/schema/reports';

import { isAfter, isBefore, max, min } from 'date-fns';
import {
	type SettlementReport,
	type SettlementReportDocument,
	type SettlementReportDocumentRow,
	type SettlementReports,
	parseSettlementRow,
	settlementReport,
	settlementReportDocument,
	settlementReports,
} from '../schema/settlement-reports';
import { type ValueOf, waitRateLimitTime } from './utils';

export function filterSettlementReportDocument(
	existReports: SettlementReports,
	newReport: SettlementReport,
	newReportDocument: SettlementReportDocument,
): SettlementReportDocument {
	for (const existReport of existReports) {
		// 既存のデータの内部の範囲であれば空白の配列を返す
		if (
			isBefore(newReport.dataStartTime, existReport.dataStartTime) &&
			isAfter(newReport.dataEndTime, existReport.dataEndTime)
		)
			return [];

		// かぶっている範囲を取得
		const coveredRange = getOverlappingRange(existReport, newReport);

		// かぶっている範囲がないならスキップ
		if (coveredRange === null) continue;
		// かぶっている範囲があるなら今のデータをかぶっている範囲以外のものにフィルター
		newReportDocument.filter(
			row =>
				!(
					isBefore(row.postedDate, coveredRange.start) &&
					isAfter(row.postedDate, coveredRange.end)
				),
		);
	}

	// 結果を返す
	return newReportDocument;
}

function isExistSettlementReport(
	existReports: SettlementReports,
	newReport: SettlementReport,
) {
	for (const existReport of existReports) {
		if (existReport.reportId === newReport.reportId) {
			return true;
		}
	}
	return false;
}

export async function getAllSettlementReportsRetryRateLimit(
	api: Client<paths>,
	existReports: SettlementReports,
): Promise<SettlementReports> {
	let nextToken: string | undefined = undefined;
	const result: SettlementReports = [];

	const maxLoopCount = 500;
	let loopCount = 0;
	while (nextToken || loopCount === 0) {
		const { data, error, response } = await getSettlementReports(api);

		const reports = data?.reports;
		nextToken = data?.nextToken;

		if (reports) {
			for (const report of reports) {
				// ステータスがdoneじゃなければスキップ
				if (report.processingStatus !== 'DONE') continue;
				const formattedReport = settlementReport.parse({
					...report,
					sellerKanrikunSaveTime: new Date(),
				});
				// 既存のレポートであればスキップ
				if (isExistSettlementReport(existReports, formattedReport))
					continue;
				result.push(formattedReport);
			}
		}
		if (error) {
			// 429(レートリミット)なら2分待ってリトライ
			if (response.status === 429) {
				console.warn(error, response);
				await new Promise(resolve => setTimeout(resolve, 120 * 1000));
			} else {
				console.error(error, response);
				break;
			}
		} else if (nextToken === undefined) {
			// エラー出ないかつnextTokenがなくなれば終了
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

		// 一分待つ
		await waitRateLimitTime(response, 60);
	}

	return result;
}

export async function getAllSettlementReportsUntilRateLimit(
	api: Client<paths>,
	existReports: SettlementReports,
): Promise<SettlementReports> {
	let nextToken: string | undefined = undefined;
	const result: SettlementReports = [];

	const maxLoopCount = 500;
	let loopCount = 0;
	while (nextToken || loopCount === 0) {
		const { data, error, response } = await getSettlementReports(
			api,
			nextToken,
		);

		const reports = data?.reports;
		nextToken = data?.nextToken;

		if (reports) {
			for (const report of reports) {
				// ステータスがdoneじゃなければスキップ
				if (report.processingStatus !== 'DONE') continue;
				const formattedReport = settlementReport.parse({
					...report,
					sellerKanrikunSaveTime: new Date(),
				});
				// 既存のレポートであればスキップ
				if (isExistSettlementReport(existReports, formattedReport))
					continue;
				result.push(formattedReport);
			}
		}

		// ネクストトークンがなければ終了
		if (nextToken === undefined) {
			if (!(response.status === 429 || response.status === 200)) {
				// 429 or 200でない場合エラー
				console.error(error, response);
			}

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

		await waitRateLimitTime(response, 60);
	}

	return result;
}

interface SettlementReportsDocumentResult {
	reports: SettlementReports;
	document: SettlementReportDocument;
}
export async function getSettlementReportsDocumentRetryRateLimit(
	api: Client<paths>,
	reports: SettlementReports,
): Promise<SettlementReportsDocumentResult> {
	const result: SettlementReportsDocumentResult = {
		reports: [],
		document: [],
	};
	for (const report of reports) {
		const documentResult = await getReportDocument(
			api,
			report.reportDocumentId,
		);
		if (!documentResult.isOk()) {
			if (documentResult.error.status === 429) {
				// レートリミットなら30秒待ってリトライ
				console.warn(documentResult.error);
				await new Promise(resolve => setTimeout(resolve, 30 * 1000));
				continue;
			} else {
				console.error(documentResult.error);
				break;
			}
		}
		const response = documentResult.value;
		const reader = response.body?.getReader();
		if (!reader) {
			console.warn('stream not available');
			break;
		}

		const strObj = papaparseOnStream(reader);
		const parsedObj = settlementReportDocument.parse(strObj);

		result.reports.push(report);
		result.document.concat(parsedObj);

		await waitRateLimitTime(response, 0.5);
	}

	return result;
}

export async function getSettlementReportsDocumentUntilRateLimit(
	api: Client<paths>,
	reports: SettlementReports,
): Promise<SettlementReportsDocumentResult> {
	const result: SettlementReportsDocumentResult = {
		reports: [],
		document: [],
	};
	for (const report of reports) {
		const documentResult = await getReportDocument(
			api,
			report.reportDocumentId,
		);
		if (!documentResult.isOk()) {
			if (documentResult.error.status !== 429) {
				// 429出なければエラー
				console.error(documentResult.error);
			}
			break;
		}
		const reader = documentResult.value.body?.getReader();
		if (!reader) {
			console.warn('stream not available');
			break;
		}

		const strObj = await papaparseOnStream(reader);
		const parsedObj: SettlementReportDocument = strObj
			.map(row => parseSettlementRow(row)) // 各行をパース
			.filter((row): row is SettlementReportDocumentRow => row !== null); // null を除外
		result.reports.push(report);
		result.document.push(...parsedObj);
	}

	return result;
}

async function papaparseOnStream(
	reader: ReadableStreamDefaultReader<Uint8Array>,
) {
	const result: Record<string, string>[] = [];
	const decoder = new TextDecoder('utf-8');

	return new Promise<Record<string, string>[]>((resolve, reject) => {
		// パース用のPapaparseストリームを作成
		const papaStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
			header: true, // CSVヘッダーの有無
			delimiter: '\t', // 必要に応じて区切り文字を設定
		});

		// パース時のイベントハンドラ
		papaStream.on('data', (row: Record<string, string>) => {
			result.push(row);
		});

		// パース完了時
		papaStream.on('end', () => {
			resolve(result);
		});

		// エラーハンドリング
		papaStream.on('error', error => {
			console.error('Error parsing CSV:', error);
			reject(result);
		});

		// ストリームを読み取りながらPapaparseに送信
		(async () => {
			try {
				let buffer = '';
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					// チャンクをデコードしてPapaparseに渡す
					buffer += decoder.decode(value, {
						stream: true,
					});
					papaStream.write(buffer);
					buffer = ''; // 書き込み後にバッファをリセット
				}
				papaStream.end(); // ストリームの終了を通知
			} catch (err) {
				console.error('Error reading stream:', err);
				papaStream.end();
				reject(err);
			}
		})();
	});
}

type DateRange = {
	start: Date;
	end: Date;
};
function getOverlappingRange(
	alpha: SettlementReport,
	beta: SettlementReport,
): DateRange | null {
	const start1 = new Date(alpha.dataStartTime);
	const end1 = new Date(alpha.dataEndTime);
	const start2 = new Date(beta.dataStartTime);
	const end2 = new Date(beta.dataEndTime);

	// 重複があるか確認
	if (isBefore(end1, start2) || isAfter(end2, start1)) {
		return null; // 重複なし
	}

	// 重複範囲を計算
	const overlapStart = max([start1, start2]);
	const overlapEnd = min([end1, end2]);

	return { start: overlapStart, end: overlapEnd };
}

// 一覧の取得
async function getSettlementReports(
	api: Client<paths>,
	nextToken: string | undefined = undefined,
) {
	return await api.GET('/reports/2021-06-30/reports', {
		params: {
			query: nextToken
				? {
						nextToken,
					}
				: {
						reportTypes: [
							'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
						],
						pageSize: 100, // 最大を指定
					},
		},
	});
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
	if (url) {
		return new Ok(await fetch(url));
	} else {
		return new Err(response);
	}
}
