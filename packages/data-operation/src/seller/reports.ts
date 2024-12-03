import type {
	ReportDocumentRowJson,
	SettlementReportDocumentResponse,
	SettlementReportType,
	SettlementReportsResponse,
} from '../../types';
import { ReportDocumentRowSchema } from '../../types';

export async function getSettlementReports(
	accessToken: string,
): Promise<SettlementReportType[]> {
	const result: SettlementReportType[] = [];

	const reports = await fetch(
		'https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/reports?reportTypes=GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);
	const reportsData = (await reports.json()) as SettlementReportsResponse;

	if ('errors' in reportsData) {
		console.error('Error, please try again: ', reportsData);
	} else {
		// nextTokenがある場合は再帰的に取得
		let nextToken = reportsData.nextToken;
		while (nextToken) {
			const nextReports: SettlementReportsResponse =
				await getReportsByNextToken(nextToken, accessToken);
			if ('errors' in nextReports) {
				console.error('Error, please try again: ', nextReports);
				break;
			} else {
				nextToken = nextReports.nextToken;
				result.push(...nextReports.reports);
			}
		}
	}
	return result;
}
async function getReportsByNextToken(nextToken: string, accessToken: string) {
	const reponse = await fetch(
		`https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/reports?nextToken=${encodeURIComponent(nextToken)}`,
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);

	const responseData = (await reponse.json()) as SettlementReportsResponse;
	return responseData;
}

export async function getReportDocument(
	reportDocumentId: string,
	accessToken: string,
) {
	const response = await fetch(
		`https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/documents/${reportDocumentId}`,
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);

	const reportDocumentData =
		(await response.json()) as SettlementReportDocumentResponse;

	if ('errors' in reportDocumentData) {
		console.error('Error, please try again: ', reportDocumentData);
	} else {
		const reportDocumentText = await fetch(reportDocumentData.url, {
			method: 'GET',
		});

		const reportDocumentTextData = await reportDocumentText.text();
		return reportDocumentTextData;
	}

	return 'error';
}

export function reportDocumentTextToJson(csv: string): ReportDocumentRowJson[] {
	// 改行で分割
	const lines = csv.split('\n');
	const headers = lines[0].split('\t');

	// ヘッダーをキーにしてオブジェクトに変換
	return lines.slice(1).map(line => {
		// タブで分割
		const values = line.split('\t');
		const row: Record<string, string> = {};

		// ヘッダーと値をセット
		headers.forEach((header, index) => {
			row[header] = values[index] || '';

			if (header === 'settlement-start-date' && row[header] !== '') {
				console.log('header!', row[header]);
			}
		});

		// zodでパース
		return ReportDocumentRowSchema.parse(row);
	});
}
