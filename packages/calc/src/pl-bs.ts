import type { CostPrice } from '../types/cost';
import type { PlbsData } from '../types/pl-bs';
import type { ReportDocumentRowJson } from '../types/reports';

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
} from './reports';

export function getPlbsData(rangedData: ReportDocumentRowJson[]): PlbsData {
	const principal = getPrincipal(rangedData);
	const principalTax = getPrincipalTaxes(rangedData);
	const shipping = getShipping(rangedData);
	const shippingTax = getShippingTaxes(rangedData);
	const refund = getRefund(rangedData);
	const salesWithTax = getSalesWithTax(
		principal,
		principalTax,
		shipping,
		shippingTax,
		refund,
	);
	const salesWithoutTax = getSalesWithoutTax(principal, shipping, refund);
	const netSalesWithTax = getNetSales(salesWithTax, refund);
	const netSalesWithoutTax = getNetSales(salesWithoutTax, refund);
	const costPrice = 0;
	const grossProfitWithTax = getGrossProfit(netSalesWithTax, costPrice);
	const grossProfitWithoutTax = getGrossProfit(netSalesWithoutTax, costPrice);
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
	const operatingProfitWithTax = getOperatingProfit(grossProfitWithTax, sga);
	const operatingProfitWithoutTax = getOperatingProfit(
		grossProfitWithoutTax,
		sga,
	);
	const unpaidBalance = 0;
	const amazonOtherWithTax = getAmazonOther(
		unpaidBalance,
		salesWithTax,
		sga,
		amazonAds,
	);
	const amazonOtherWithoutTax = getAmazonOther(
		unpaidBalance,
		salesWithoutTax,
		sga,
		amazonAds,
	);

	const accruedConsumptionTax = principalTax + shippingTax;
	const outputConsumptionTax = accruedConsumptionTax;

	console.log(principal, principalTax);
	return {
		salesWithTax,
		salesWithoutTax,
		principal,
		principalTax,
		shipping,
		shippingTax,
		otherTax: 0,
		refund,
		netSalesWithTax,
		netSalesWithoutTax,
		costPrice,
		grossProfitWithTax,
		grossProfitWithoutTax,
		sga,
		amazonAds,
		promotion,
		salesCommission,
		fbaShippingFee,
		inventoryStorageFee,
		inventoryUpdateFee,
		shippingReturnFee,
		subscriptionFee,
		amazonOtherWithTax,
		amazonOtherWithoutTax,
		operatingProfitWithTax,
		operatingProfitWithoutTax,
		unpaidBalance,
		inventoryAssets: 0,
		accruedConsumptionTax: accruedConsumptionTax,
		outputConsumptionTax: outputConsumptionTax,
	} as PlbsData;
}

export function getSumPlbsData(data: PlbsData[]): PlbsData {
	return data.reduce((acc: PlbsData, cur: PlbsData) => {
		for (const key of Object.keys(acc) as (keyof PlbsData)[]) {
			acc[key] += cur[key] || 0;
		}
		return acc;
	}, getZeroPlbsData());
}
function getZeroPlbsData(): PlbsData {
	return {
		salesWithTax: 0,
		salesWithoutTax: 0,
		principal: 0,
		principalTax: 0,
		shipping: 0,
		shippingTax: 0,
		otherTax: 0,
		refund: 0,
		netSalesWithTax: 0,
		netSalesWithoutTax: 0,
		costPrice: 0,
		grossProfitWithTax: 0,
		grossProfitWithoutTax: 0,
		sga: 0,
		amazonAds: 0,
		promotion: 0,
		salesCommission: 0,
		fbaShippingFee: 0,
		inventoryStorageFee: 0,
		inventoryUpdateFee: 0,
		shippingReturnFee: 0,
		subscriptionFee: 0,
		amazonOtherWithTax: 0,
		amazonOtherWithoutTax: 0,
		operatingProfitWithTax: 0,
		operatingProfitWithoutTax: 0,
		unpaidBalance: 0,
		inventoryAssets: 0,
		accruedConsumptionTax: 0,
		outputConsumptionTax: 0,
	} as PlbsData;
}

// 売上（Sales）
export function getSalesWithTax(
	principal: number,
	PrincipalTax: number,
	shipping: number,
	ShippingTax: number,
	refund: number,
) {
	return principal + PrincipalTax + shipping + ShippingTax + refund;
}
export function getSalesWithoutTax(
	principal: number,
	shipping: number,
	refund: number,
) {
	return principal + shipping + refund;
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
	const quantityBySKU = orderData.reduce(
		(acc: Record<string, number>, row) => {
			const sku = row.sku;
			const quantity = Number(row['quantity-purchased']) || 0;

			// SKUがまだリストにない場合は初期化
			acc[sku] = (acc[sku] || 0) + quantity;

			return acc;
		},
		{},
	);

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
