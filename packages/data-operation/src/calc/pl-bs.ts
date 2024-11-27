import type { CostPrice, PlbsData, ReportDocumentRowJson } from '../../types';
import {
	getFbaShippingFee,
	getPrincipal,
	getPrincipalTaxes,
	getPromotion,
	getRefund,
	getSalesCommissionFee,
	getShipping,
	getShippingReturnFee,
	getShippingTaxes,
	getSubscriptionFee,
} from './report';

export function getPlbsData(rangedData: ReportDocumentRowJson[]): PlbsData {
	const principal = getPrincipal(rangedData);
	const principalTax = getPrincipalTaxes(rangedData);
	const shipping = getShipping(rangedData);
	const shippingTax = getShippingTaxes(rangedData);
	const refund = getRefund(rangedData);
	const sales = getSales(
		principal,
		principalTax,
		shipping,
		shippingTax,
		refund,
	);
	const netSales = getNetSales(sales, refund);
	const costPrice = 0;
	const grossProfit = getGrossProfit(netSales, costPrice);
	const amazonAds = 0;
	const promotion = getPromotion(rangedData);
	const salesCommission = getSalesCommissionFee(rangedData);
	const fbaShippingFee = getFbaShippingFee(rangedData);
	const inventoryStorageFee = 0;
	const inventoryUpdateFee = 0;
	const shippingReturnFee = getShippingReturnFee(rangedData);
	const subscriptionFee = getSubscriptionFee(rangedData);
	const sga = getSGA(
		amazonAds,
		promotion,
		salesCommission,
		fbaShippingFee,
		inventoryStorageFee,
		inventoryUpdateFee,
		shippingReturnFee,
		subscriptionFee,
	);
	const operatingProfit = getOperatingProfit(grossProfit, sga);
	const unpaidBalance = 0;
	const amazonOther = getAmazonOther(unpaidBalance, sales, sga, amazonAds);

	console.log(principal, principalTax);
	return {
		sales,
		principal,
		principalTax,
		shipping,
		otherTax: 0,
		refund,
		netSales,
		costPrice,
		grossProfit,
		sga,
		amazonAds,
		promotion,
		salesCommission,
		fbaShippingFee,
		inventoryStorageFee,
		inventoryUpdateFee,
		shippingReturnFee,
		subscriptionFee,
		amazonOther,
		operatingProfit,
		unpaidBalance,
		inventoryAssets: 0,
	} as PlbsData;
}

export function getSumPlbsData(data: PlbsData[]): PlbsData {
	return data.reduce(
		(acc, cur) => {
			acc.sales += cur.sales;
			acc.principal += cur.principal;
			acc.principalTax += cur.principalTax;
			acc.shipping += cur.shipping;
			acc.otherTax += cur.otherTax;
			acc.refund += cur.refund;
			acc.netSales += cur.netSales;
			acc.costPrice += cur.costPrice;
			acc.grossProfit += cur.grossProfit;
			acc.sga += cur.sga;
			acc.amazonAds += cur.amazonAds;
			acc.promotion += cur.promotion;
			acc.salesCommission += cur.salesCommission;
			acc.fbaShippingFee += cur.fbaShippingFee;
			acc.inventoryStorageFee += cur.inventoryStorageFee;
			acc.inventoryUpdateFee += cur.inventoryUpdateFee;
			acc.shippingReturnFee += cur.shippingReturnFee;
			acc.subscriptionFee += cur.subscriptionFee;
			acc.amazonOther += cur.amazonOther;
			acc.operatingProfit += cur.operatingProfit;
			acc.unpaidBalance += cur.unpaidBalance;
			acc.inventoryAssets += cur.inventoryAssets;
			return acc;
		},
		{
			sales: 0,
			principal: 0,
			principalTax: 0,
			shipping: 0,
			otherTax: 0,
			refund: 0,
			netSales: 0,
			costPrice: 0,
			grossProfit: 0,
			sga: 0,
			amazonAds: 0,
			promotion: 0,
			salesCommission: 0,
			fbaShippingFee: 0,
			inventoryStorageFee: 0,
			inventoryUpdateFee: 0,
			shippingReturnFee: 0,
			subscriptionFee: 0,
			amazonOther: 0,
			operatingProfit: 0,
			unpaidBalance: 0,
			inventoryAssets: 0,
		},
	);
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
