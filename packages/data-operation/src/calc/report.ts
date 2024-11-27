import type { ReportDocumentRowJson } from '../../types';

function getFilteredRowSum(
	data: ReportDocumentRowJson[],
	filters: [keyof ReportDocumentRowJson, string][],
	sumKey: keyof ReportDocumentRowJson = 'price-amount',
) {
	return data
		.filter(row => filters.every(([key, value]) => row[key] === value))
		.reduce((sum, row) => {
			const amount = row[sumKey];
			return typeof amount === 'number' ? sum + amount : sum;
		}, 0);
}

// 商品代金 (Principal)
export function getProductPrice(data: ReportDocumentRowJson[]) {
	const productPrice = getFilteredRowSum(data, [
		['transaction-type', 'Order'],
		['price-type', 'Principal'],
	]);
	return productPrice;
}

// 商品代金に対する税金 (Principal Taxes)
export function getPrincipalTaxes(data: ReportDocumentRowJson[]) {
	const PrincipalTax = getFilteredRowSum(data, [
		['transaction-type', 'Order'],
		['price-type', 'PrincipalTax'],
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
export function getSalesFee(data: ReportDocumentRowJson[]) {
	const salesFee = getFilteredRowSum(
		data,
		[
			['transaction-type', 'Order'],
			['item-related-fee-type', 'Commission'],
		],
		'item-related-fee-amount',
	);
	return salesFee;
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
