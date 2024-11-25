import { z } from 'zod';

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

export const ReportDocumentRowSchema = z.object({
	'settlement-id': z.string().default(''),
	'settlement-start-date': z
		.string()
		.optional()
		.transform(val => (val ? new Date(val) : '')),
	'settlement-end-date': z
		.string()
		.optional()
		.transform(val => (val ? new Date(val) : '')),
	'deposit-date': z
		.string()
		.optional()
		.transform(val => (val ? new Date(val) : '')),
	'total-amount': z.string().default(''),
	currency: z.string().default(''),
	'transaction-type': z.string().default(''),
	'order-id': z.string().default(''),
	'merchant-order-id': z.string().default(''),
	'adjustment-id': z.string().default(''),
	'shipment-id': z.string().default(''),
	'marketplace-name': z.string().default(''),
	'shipment-fee-type': z.string().default(''),
	'shipment-fee-amount': z.string().default(''),
	'order-fee-type': z.string().default(''),
	'order-fee-amount': z.string().default(''),
	'fulfillment-id': z.string().default(''),
	'posted-date': z
		.string()
		.optional()
		.transform(val => (val ? new Date(val) : '')),
	'order-item-code': z.string().default(''),
	'merchant-order-item-id': z.string().default(''),
	'merchant-adjustment-item-id': z.string().default(''),
	sku: z.string().default(''),
	'quantity-purchased': z.string().default(''),
	'price-type': z.string().default(''),
	'price-amount': z.string().default(''),
	'item-related-fee-type': z.string().default(''),
	'item-related-fee-amount': z
		.string()
		.optional()
		.transform(val => {
			if (val) {
				const num = Number.parseFloat(val);
				return Number.isNaN(num) ? '' : num;
			}
			return '';
		}),
	'misc-fee-amount': z.string().default(''),
	'other-fee-amount': z.string().default(''),
	'other-fee-reason-description': z.string().default(''),
	'promotion-id': z.string().default(''),
	'promotion-type': z.string().default(''),
	'promotion-amount': z.string().default(''),
	'direct-payment-type': z.string().default(''),
	'direct-payment-amount': z.string().default(''),
	'other-amount': z.string().default(''),
});

export type ReportDocumentRowJson = z.infer<typeof ReportDocumentRowSchema>;
