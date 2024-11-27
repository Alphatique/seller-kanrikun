import type { CostPrice, ReportDocumentRowJson } from '../../types';

export function getRangedData(
	start: Date,
	end: Date,
	data: ReportDocumentRowJson[],
	key: keyof ReportDocumentRowJson = 'posted-date',
) {
	return data.filter(row => {
		const date = row[key] as Date;
		return date >= start && date <= end;
	});
}

// 売上（Sales）
export function getSales(
	principal: number,
	PrincipalTax: number,
	shipping: number,
	ShippingTax: number,
	refund: number,
) {
	return principal + PrincipalTax + shipping + ShippingTax - refund;
}

// 純売上（Net Sales）
export function getNetSales(sales: number, refund: number) {
	return sales - refund;
}

// 原価（Cost）
export function getCostPrice(
	reportData: ReportDocumentRowJson[],
	costData: CostPrice[],
) {
	// まず、"Order" タイプの行をフィルタリング
	const orderData = reportData.filter(
		row => row['transaction-type'] === 'Order',
	);

	// SKUごとに quantity-purchased を集計
	const quantityBySKU = orderData.reduce((acc: Record<string, number>, row) => {
		const sku = row.sku;
		const quantity = Number(row['quantity-purchased']) || 0;

		// SKUがまだリストにない場合は初期化
		acc[sku] = (acc[sku] || 0) + quantity;

		return acc;
	}, {});

	return quantityBySKU;
}

// 粗利益（Gross Profit）
export function getGrossProfit(netSales: number, costPrice: number) {
	return netSales - costPrice;
}

// 販売費及び一般管理費（SG&A）
export function getSGA(
	amazonAds: number,
	promotion: number,
	salesCommission: number,
	fbaShippingFee: number,
	inventoryStorageFee: number,
	inventoryUpdateFee: number,
	shippingReturnFee: number,
	subscriptionFee: number,
) {
	return (
		amazonAds +
		promotion +
		salesCommission +
		fbaShippingFee +
		inventoryStorageFee +
		inventoryUpdateFee +
		shippingReturnFee +
		subscriptionFee
	);
}

// amazonその他
export function getAmazonOther(
	unpaidBalance: number,
	sales: number,
	SGA: number,
	amazonAds: number,
) {
	return unpaidBalance - (sales + (SGA - amazonAds));
}

// 営業利益
export function getOperatingProfit(grossProfit: number, SGA: number) {
	return grossProfit - SGA;
}
