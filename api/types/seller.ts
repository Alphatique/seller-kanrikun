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
	dataEndTime: string; // Date
	createdTime: string; // Date
	processingStartTime: string; // Date
	dataStartTime: string; // Date
};

export type SettlementReportDocumentResponse = {
	reportDocumentId: string;
	url: string;
};

export type InventorySummariesResponse = {
	payload: InventorySummariesPayload;
};

export type InventorySummariesPayload = {
	granularity: 'Marketplace' | string; // TODO: Add more granularities
	granularityId: 'A1VC38T7YXB528' | string; // TODO: Add more granularityIds
	inventorySummaries: InventorySummary[];
};

export type InventorySummary = {
	asin: string;
	fnSku: string;
	sellerSku: string;
	condition: 'NewItem' | string; // TODO: Add more conditions
	lastUpdatedTime: string; // Date
	productName: string;
	totalQuantity: number;
	stores: []; // TODO: Add store type
};

export type CatalogItemsResponse = {
	numberOfResults: number;
	items: CatalogItem[];
};

export type CatalogItem = {
	asin: string;
	summaries: CatalogItemSummary[];
};

export type CatalogItemSummary = {
	marketplaceId: string;
	adultProduct: boolean;
	autographed: boolean;
	brand: string;
	browseClassification: {
		displayName: string;
		classificationId: number;
	};
	color: string;
	itemClassification: string;
	itemName: string;
	manufacturer: string;
	memorabilia: boolean;
	modelNumber: string;
	partNumber: string;
	tradeInEligible: boolean;
	websiteDisplayGroup: string;
	websiteDisplayGroupName: string;
};
