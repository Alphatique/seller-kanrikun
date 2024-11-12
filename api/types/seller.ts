export type SettlementReportsResponse = {
	reports: SettlementReport[];
	nextToken?: string;
};

export type SettlementReport = {
	reportType: 'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE';
	processingEndTime: string;
	processingStatus: 'DONE' | string; // TODO: Add more statuses
	marketplaceIds: string[];
	reportDocumentId: string;
	reportId: string;
	dataEndTime: string;
	createdTime: string;
	processingStartTime: string;
	dataStartTime: string;
};

export type SettlementReportDocumentResponse = {
	reportDocumentId: string;
	url: string;
};
