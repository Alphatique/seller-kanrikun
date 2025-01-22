import { z } from 'zod';

export const settlementReport = z.object({
	reportId: z.string(),
	reportDocumentId: z.string(),
	reportType: z.literal('GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE'),
	processingStatus: z.literal('DONE'),
	marketplaceIds: z.array(z.string()),
	dataStartTime: z.coerce.date(),
	dataEndTime: z.coerce.date(),
	createdTime: z.coerce.date(),
	sellerKanrikunSaveTime: z.coerce.date(),
});
export const settlementReports = z.array(settlementReport);

export type SettlementReport = z.infer<typeof settlementReport>;
export type SettlementReports = z.infer<typeof settlementReports>;

export const settlementReportDocumentRow = z.object({
	settlementId: z.number(),
	transactionType: z.string(),
	postedDate: z.coerce.date(),
	priceAmount: z.number(),
	itemRelatedFeeAmount: z.number(),
	promotionAmount: z.number(),
	shipmentFeeAmount: z.number(),
	orderFeeAmount: z.number(),
	miscFeeAmount: z.number(),
	otherFeeAmount: z.number(),
	otherAmount: z.number(),
	priceType: z.string(),
	sku: z.string(),
	promotionType: z.string(),
	itemRelatedFeeType: z.string(),
	otherFeeReasonDescription: z.string(),
	depositDate: z.coerce.date(),
	currency: z.string(),
	marketplaceName: z.string(),
	quantityPurchased: z.number(),
	promotionId: z.string(),
});
export const settlementReportDocument = z.array(settlementReportDocumentRow);

export type SettlementReportDocumentRow = z.infer<
	typeof settlementReportDocumentRow
>;
export type SettlementReportDocument = z.infer<typeof settlementReportDocument>;
