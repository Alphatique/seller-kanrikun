import { z } from 'zod';

export const settlementReportMeta = z.object({
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
export const settlementReportMetaArray = z.array(settlementReportMeta);

export type SettlementReportMeta = z.infer<typeof settlementReportMeta>;
export type SettlementReportMetaArray = z.infer<
	typeof settlementReportMetaArray
>;

// パース関数
export function parseSettlementRow(
	row: Record<string, string>,
): SettlementReportDocumentRow | null {
	try {
		if (row['posted-date'] === '') {
			return null;
		}
		// データの整形
		const transformedRow = {
			settlementId: Number.parseInt(row['settlement-id'], 10),
			transactionType: row['transaction-type'],
			postedDate: row['posted-date'],
			sku: row.sku,
			priceAmount: row['price-amount']
				? Number.parseFloat(row['price-amount'])
				: undefined,
			itemRelatedFeeAmount: row['item-related-fee-amount']
				? Number.parseFloat(row['item-related-fee-amount'])
				: undefined,
			promotionAmount: row['promotion-amount']
				? Number.parseFloat(row['promotion-amount'])
				: undefined,
			shipmentFeeAmount: row['shipment-fee-amount']
				? Number.parseFloat(row['shipment-fee-amount'])
				: undefined,
			orderFeeAmount: row['order-fee-amount']
				? Number.parseFloat(row['order-fee-amount'])
				: undefined,
			miscFeeAmount: row['misc-fee-amount']
				? Number.parseFloat(row['misc-fee-amount'])
				: undefined,
			otherFeeAmount: row['other-fee-amount']
				? Number.parseFloat(row['other-fee-amount'])
				: undefined,
			otherAmount: row['other-amount']
				? Number.parseFloat(row['other-amount'])
				: undefined,
			priceType: row['price-type'],
			promotionType: row['promotion-type'],
			itemRelatedFeeType: row['item-related-fee-type'],
			otherFeeReasonDescription: row['other-fee-reason-description'],
			depositDate: row['deposit-date']
				? new Date(row['deposit-date'])
				: undefined,
			currency: row.currency,
			marketplaceName: row['marketplace-name'],
			quantityPurchased: row['quantity-purchased']
				? Number.parseInt(row['quantity-purchased'], 10)
				: undefined,
			promotionId: row['promotion-id'],
		};

		// スキーマを使って検証
		return settlementReportDocumentRow.parse(transformedRow);
	} catch (err) {
		console.error('データ変換エラー', err, row);
		return null; // 必要に応じてエラー処理を追加
	}
}

export const settlementReportDocumentRow = z.object({
	settlementId: z.number(),
	transactionType: z.string(),
	postedDate: z.coerce.date(),
	sku: z.string(),
	priceAmount: z.number().optional(),
	itemRelatedFeeAmount: z.number().optional(),
	promotionAmount: z.number().optional(),
	shipmentFeeAmount: z.number().optional(),
	orderFeeAmount: z.number().optional(),
	miscFeeAmount: z.number().optional(),
	otherFeeAmount: z.number().optional(),
	otherAmount: z.number().optional(),
	priceType: z.string().optional(),
	promotionType: z.string().optional(),
	itemRelatedFeeType: z.string().optional(),
	otherFeeReasonDescription: z.string().optional(),
	depositDate: z.coerce.date().optional(),
	currency: z.string().optional(),
	marketplaceName: z.string().optional(),
	quantityPurchased: z.number().optional(),
	promotionId: z.string().optional(),
});
export const settlementReportDocument = z.array(settlementReportDocumentRow);

export type SettlementReportDocumentRow = z.infer<
	typeof settlementReportDocumentRow
>;
export type SettlementReportDocument = z.infer<typeof settlementReportDocument>;
