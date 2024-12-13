'use server';

import type { PlbsData } from '@seller-kanrikun/calc/types';

// 全然アクション出来てない
export function getReportData(): PlbsData[] {
	const sampleData: PlbsData[] = [];
	for (let year = 2022; year <= 2023; year++) {
		for (let month = 1; month <= 12; month++) {
			sampleData.push({
				salesWithTax: Math.random() * 10000,
				salesWithoutTax: Math.random() * 8000,
				principal: Math.random() * 5000,
				principalTax: Math.random() * 500,
				shipping: Math.random() * 1000,
				shippingTax: Math.random() * 100,
				otherTax: Math.random() * 200,
				refund: Math.random() * 300,
				netSalesWithTax: Math.random() * 9000,
				netSalesWithoutTax: Math.random() * 7000,
				costPrice: Math.random() * 4000,
				grossProfitWithTax: Math.random() * 6000,
				grossProfitWithoutTax: Math.random() * 5000,
				sga: Math.random() * 2000,
				amazonAds: Math.random() * 1000,
				promotion: Math.random() * 500,
				salesCommission: Math.random() * 700,
				fbaShippingFee: Math.random() * 300,
				inventoryStorageFee: Math.random() * 200,
				inventoryUpdateFee: Math.random() * 100,
				shippingReturnFee: Math.random() * 150,
				subscriptionFee: Math.random() * 50,
				amazonOtherWithTax: Math.random() * 400,
				amazonOtherWithoutTax: Math.random() * 300,
				operatingProfitWithTax: Math.random() * 5000,
				operatingProfitWithoutTax: Math.random() * 4000,
				unpaidBalance: Math.random() * 1000,
				inventoryAssets: Math.random() * 2000,
				accruedConsumptionTax: Math.random() * 300,
				outputConsumptionTax: Math.random() * 400,
			});
		}
	}
	return sampleData;
}
