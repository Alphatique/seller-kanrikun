import type {
	SettlementReportDocumentResponse,
	SettlementReportType,
	SettlementReportsResponse,
} from '../../types';

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
	const reportsData: SettlementReportsResponse =
		(await reports.json()) as SettlementReportsResponse;

	if ('errors' in reportsData) {
		if (reportsData.errors && Array.isArray(reportsData.errors)) {
			reportsData.errors.forEach((error, index) => {
				console.error(`Error ${index + 1}:`, error);
			});
		} else {
			console.error('Error, please try again: ', reportsData);
		}
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
async function getReportsByNextToken(
	nextToken: string,
	accessToken: string,
): Promise<SettlementReportsResponse> {
	const reponse = await fetch(
		`https://sellingpartnerapi-fe.amazon.com/reports/2021-06-30/reports?nextToken=${encodeURIComponent(nextToken)}`,
		{
			method: 'GET',
			headers: {
				'x-amz-access-token': accessToken,
			},
		},
	);

	const responseData: SettlementReportsResponse =
		(await reponse.json()) as SettlementReportsResponse;
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

	const reportDocumentData: SettlementReportDocumentResponse =
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
