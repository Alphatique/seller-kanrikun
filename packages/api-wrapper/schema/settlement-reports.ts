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
});
export const settlementReports = z.array(settlementReport);

export type SettlementReport = z.infer<typeof settlementReport>;
export type SettlementReports = z.infer<typeof settlementReports>;

export const settlementReportDocumentRow = z.object({
	settlementId: z.number(), // 必須
	transactionType: z.string(), // 必須
	postedDate: z.coerce.date(), // 必須
	priceAmount: z.number().optional(), // 必須
	itemRelatedFeeAmount: z.number().optional(), // 必須
	promotionAmount: z.number().optional(), // 必須
	shipmentFeeAmount: z.number().optional(), // 必須
	orderFeeAmount: z.number().optional(), // 必須
	miscFeeAmount: z.number().optional(), // 必須
	otherFeeAmount: z.number().optional(), // 必須
	otherAmount: z.number().optional(), // 必須
	sku: z.string().optional(), // 必須
	priceType: z.string().optional(),
	promotionType: z.string().optional(),
	itemRelatedFeeType: z.string().optional(),
	otherFeeReasonDescription: z.string().optional(),
	settlementStartDate: z.string().datetime().optional(),
	settlementEndDate: z.string().datetime().optional(),
	depositDate: z.string().datetime().optional(),
	totalAmount: z.number().optional(),
	currency: z.string().optional(),
	orderId: z.string().optional(),
	merchantOrderId: z.string().optional(),
	adjustmentId: z.string().optional(),
	shipmentId: z.string().optional(),
	marketplaceName: z.string().optional(),
	fulfillmentId: z.string().optional(),
	orderItemCode: z.string().optional(),
	merchantOrderItemId: z.string().optional(),
	merchantAdjustmentItemId: z.string().optional(),
	quantityPurchased: z.number().optional(),
	directPaymentType: z.string().optional(),
	directPaymentAmount: z.number().optional(),
	promotionId: z.string().optional(),
});
export const settlementReportDocument = z.array(settlementReportDocumentRow);

export type SettlementReportDocumentRow = z.infer<
	typeof settlementReportDocumentRow
>;
export type SettlementReportDocument = z.infer<typeof settlementReportDocument>;
