import type {
	ReportDocumentRowJson,
	SettlementReportDocumentResponse,
	SettlementReportsResponse,
} from '../../types';
import { ReportDocumentRowSchema } from '../../types';

export async function getSettlementReports(accessToken: string) {
	const reports = await fetch(
		'https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/reports?reportTypes=GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);
	const reportsData: SettlementReportsResponse = await reports.json();

	return reportsData;

	/*
	let nextToken = reportsData.nextToken;
	while (nextToken) {
		const nextReports = await getReportsByNextToken(nextToken, accessToken);
		nextToken = nextReports.nextToken;

		console.log(nextReports);
	}*/
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

	const responseData: SettlementReportsResponse = await reponse.json();
	return responseData;
}

export async function getReportDocument(
	reportDocumentId: string,
	accessToken: string,
) {
	const reportDocument = await fetch(
		`https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/documents/${reportDocumentId}`,
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);

	const reportDocumentData: SettlementReportDocumentResponse =
		await reportDocument.json();

	console.log(reportDocumentData);
	const reportDocumentText = await fetch(reportDocumentData.url, {
		method: 'GET',
	});

	const reportDocumentTextData = await reportDocumentText.text();

	console.log(reportDocumentTextData);

	return reportDocumentTextData;
}

export const reportDocumentTextToJson = (
	csv: string,
): ReportDocumentRowJson[] => {
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
		});

		// zodでパース
		return ReportDocumentRowSchema.parse(row);
	});
};
