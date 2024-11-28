import { z } from 'zod';

export const ReportDocumentRowSchema = z.object({
	'settlement-id': z.string().default(''),
	'settlement-start-date': z.string().optional().transform(transformDate),
	'settlement-end-date': z.string().optional().transform(transformDate), // reportdocumentから取得する時、ここら辺のデータは一番上以外空だったりする。ここに置くか諸説。
	'deposit-date': z.string().optional().transform(transformDate),
	'total-amount': z.string().optional().transform(transformFloat),
	currency: z.string().default(''),
	'transaction-type': z.string().default(''),
	'order-id': z.string().default(''),
	'merchant-order-id': z.string().default(''),
	'adjustment-id': z.string().default(''),
	'shipment-id': z.string().default(''),
	'marketplace-name': z.string().default(''),
	'shipment-fee-type': z.string().default(''),
	'shipment-fee-amount': z.string().optional().transform(transformFloat),
	'order-fee-type': z.string().default(''),
	'order-fee-amount': z.string().optional().transform(transformFloat),
	'fulfillment-id': z.string().default(''),
	'posted-date': z.string().optional().transform(transformDate),
	'order-item-code': z.string().default(''),
	'merchant-order-item-id': z.string().default(''),
	'merchant-adjustment-item-id': z.string().default(''),
	sku: z.string().default(''),
	'quantity-purchased': z.string().default(''),
	'price-type': z.string().default(''),
	'price-amount': z.string().optional().transform(transformFloat),
	'item-related-fee-type': z.string().default(''),
	'item-related-fee-amount': z.string().optional().transform(transformFloat),
	'misc-fee-amount': z.string().optional().transform(transformFloat),
	'other-fee-amount': z.string().optional().transform(transformFloat),
	'other-fee-reason-description': z.string().default(''),
	'promotion-id': z.string().default(''),
	'promotion-type': z.string().default(''),
	'promotion-amount': z.string().optional().transform(transformFloat),
	'direct-payment-type': z.string().default(''),
	'direct-payment-amount': z.string().optional().transform(transformFloat),
	'other-amount': z.string().optional().transform(transformFloat),
});
export type ReportDocumentRowJson = z.infer<typeof ReportDocumentRowSchema>;

function transformFloat(val: string | undefined): number | string {
	if (val) {
		const num = Number.parseFloat(val);
		return Number.isNaN(num) ? val : num;
	}
	return '';
}

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
