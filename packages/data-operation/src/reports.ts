import {
	type ReportDocumentRowJson,
	ReportDocumentRowSchema,
} from '../types/reports';

export function reportDocumentTextToJson(csv: string): ReportDocumentRowJson[] {
	// 改行で分割
	const lines = csv.split('\n');
	const headers = lines[0].split('\t');

	// ヘッダーをキーにしてオブジェクトに変換
	return lines.slice(1).map(line => {
		// タブで分割
		const values = line.split('\t');
		const row: Record<string, string> = {};

		// ヘッダーと値をセット
		headers.forEach((header, index) => {
			row[header] = values[index] || '';

			if (header === 'settlement-start-date' && row[header] !== '') {
				console.log('header!', row[header]);
			}
		});

		// zodでパース
		return ReportDocumentRowSchema.parse(row);
	});
}

export function getRangedData(
	start: Date,
	end: Date,
	data: ReportDocumentRowJson[],
	key: keyof ReportDocumentRowJson = 'posted-date',
): ReportDocumentRowJson[] {
	return data.filter(row => {
		const date = new Date(row[key]);
		if (date.toString() === 'Invalid Date') return false;
		return date >= start && date <= end;
	});
}

function getFilteredRowSum(
	data: ReportDocumentRowJson[],
	filters: [keyof ReportDocumentRowJson, string][],
	sumKey: keyof ReportDocumentRowJson = 'price-amount',
) {
	return data
		.filter(row => filters.every(([key, value]) => row[key] === value))
		.reduce((sum, row) => {
			const input = row[sumKey];
			if (typeof input === 'number') {
				return sum + input;
			} else if (typeof input === 'string') {
				const parsed: number = Number.parseFloat(input);
				return sum + (Number.isNaN(parsed) ? 0 : parsed);
			}
			return sum;
		}, 0);
}

// 商品代金 (Principal)
export function getPrincipal(data: ReportDocumentRowJson[]) {
	const principal = getFilteredRowSum(data, [
		['transaction-type', 'Order'],
		['price-type', 'Principal'],
	]);
	return principal;
}

// 商品代金に対する税金 (Principal Taxes)
export function getPrincipalTaxes(data: ReportDocumentRowJson[]) {
	const PrincipalTax = getFilteredRowSum(data, [
		['transaction-type', 'Order'],
		['price-type', 'Tax'],
	]);

	return PrincipalTax;
}

// 配送料 (Shipping)
export function getShipping(data: ReportDocumentRowJson[]) {
	const shipping = getFilteredRowSum(data, [
		['transaction-type', 'Order'],
		['price-type', 'Shipping'],
	]);
	return shipping;
}

// 配送料に対する税金 (Shipping Taxes)
export function getShippingTaxes(data: ReportDocumentRowJson[]) {
	const ShippingTax = getFilteredRowSum(data, [
		['transaction-type', 'Order'],
		['price-type', 'ShippingTax'],
	]);
	return ShippingTax;
}

// 返品額 (Refund)
export function getRefund(data: ReportDocumentRowJson[]) {
	// 価格合計 (Total Price for Refunds)
	const refundTotalPrice = getFilteredRowSum(data, [
		['transaction-type', 'Refund'],
	]);

	// 手数料合計 (Total Fees for Refunds)
	const refundTotalFees = getFilteredRowSum(
		data,
		[['transaction-type', 'Refund']],
		'item-related-fee-amount',
	);

	// プロモーション合計 (Total Promotion for Refunds)
	const refundTotalPromotion = getFilteredRowSum(
		data,
		[['transaction-type', 'Refund']],
		'promotion-amount',
	);

	// TaxDiscountプロモーションを除外 (Exclude TaxDiscount promotions in Refunds)
	const refundTaxDiscountExclusion = getFilteredRowSum(
		data,
		[
			['transaction-type', 'Refund'],
			['promotion-type', 'TaxDiscount'],
		],
		'promotion-amount',
	);

	// 返金合計 (Total Refunds) - TaxDiscountを除外
	const totalRefunds =
		refundTotalPrice +
		refundTotalFees +
		refundTotalPromotion -
		refundTaxDiscountExclusion;

	return totalRefunds;
}

// プロモーション費用 (Promotion)
export function getPromotion(data: ReportDocumentRowJson[]) {
	const promotion = getFilteredRowSum(
		data,
		[['promotion-type', 'Shipping']],
		'promotion-amount',
	);
	return promotion;
}

// 販売手数料 (Sales Fee)
export function getSalesCommissionFee(data: ReportDocumentRowJson[]) {
	const salesCommissionFee = getFilteredRowSum(
		data,
		[
			['transaction-type', 'Order'],
			['item-related-fee-type', 'Commission'],
		],
		'item-related-fee-amount',
	);
	return salesCommissionFee;
}

// FBA出荷手数料 (FBA Shipping Fee)
export function getFbaShippingFee(data: ReportDocumentRowJson[]) {
	const fbaShippingFee = getFilteredRowSum(
		data,
		[
			['transaction-type', 'Order'],
			['item-related-fee-type', 'FBAPerUnitFulfillmentFee'],
		],
		'item-related-fee-amount',
	);
	return fbaShippingFee;
}

// 在庫保管料 (Inventory Storage Fee)
export function getInventoryStorageFee(data: ReportDocumentRowJson[]) {
	const inventoryStorageFee = getFilteredRowSum(
		data,
		[['transaction-type', 'Storage Fee']],
		'item-related-fee-amount',
	);
	return inventoryStorageFee;
}

// 在庫更新費用 (Inventory Update Fee)
export function getInventoryUpdateFee(data: ReportDocumentRowJson[]) {
	const inventoryUpdateFee = getFilteredRowSum(
		data,
		[['transaction-type', 'StorageRenewalBilling']],
		'other-amount',
	);
	return inventoryUpdateFee;
}

// 配送返戻金 (Shipping Return Fee)
export function getShippingReturnFee(data: ReportDocumentRowJson[]) {
	const shippingReturnFee = getFilteredRowSum(
		data,
		[
			['transaction-type', 'Order'],
			['other-fee-reason-description', 'ShippingChargeback'],
		],
		'other-amount',
	);
	return shippingReturnFee;
}

// アカウント月額登録料 (Subscription Fee)
export function getSubscriptionFee(data: ReportDocumentRowJson[]) {
	const subscriptionFee = getFilteredRowSum(
		data,
		[['transaction-type', 'Subscription Fee']],
		'other-amount',
	);
	return subscriptionFee;
}

// 未入金時の売掛金 (Unpaid Balance)
export function getUnpaidBalance(data: ReportDocumentRowJson[]) {
	const unpaidBalance = getFilteredRowSum(data, [], 'total-amount');
	return unpaidBalance;
}
