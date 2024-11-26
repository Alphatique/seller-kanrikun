import { z } from 'zod';

export type SettlementReportsResponse = {
	reports: SettlementReportType[];
	nextToken?: string;
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
	'settlement-start-date': z.string().optional().transform(transformDate),
	'settlement-end-date': z.string().optional().transform(transformDate), // reportdocumentから取得する時、ここら辺のデータは一番上以外空だったりする。ここに置くか諸説。
	'deposit-date': z.string().optional().transform(transformDate),
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
	'posted-date': z.string().optional().transform(transformDate),
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

export type ReportDocumentRowJson = z.infer<typeof ReportDocumentRowSchema>;

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
