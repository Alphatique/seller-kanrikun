import { z } from 'zod';

export type SettlementReportsResponse = {
	reports: SettlementReportType[];
	nextToken?: string;
};

export type SettlementReportDocumentResponse = {
	reportDocumentId: string;
	url: string;
};

function transformDate(val: string | undefined): Date | string {
	if (val) {
		const date = new Date(val);
		if (date.toString() === 'Invalid Date') {
			return val;
		}
		return date;
	}
	return '';
}

const SettlementReportSchema = z.object({
	reportType: z.literal('GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE'),
	processingEndTime: z.string().optional().transform(transformDate),
	processingStatus: z.literal('DONE'),
	marketplaceIds: z.array(z.string()),
	reportDocumentId: z.string(),
	reportId: z.string(),
	dataEndTime: z.string().optional().transform(transformDate),
	createdTime: z.string().optional().transform(transformDate),
	processingStartTime: z.string().optional().transform(transformDate),
	dataStartTime: z.string().optional().transform(transformDate),
});
export type SettlementReportType = z.infer<typeof SettlementReportSchema>;
