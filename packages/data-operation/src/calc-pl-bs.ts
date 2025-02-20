import type {
	AmazonAdsAmount,
	FormattedSettlementReport,
	Inventory,
	PlBsWithTax,
	PlBsWithoutTax,
	PlData,
} from '../types/pl-bs';

export function addFormattedReports(
	a: FormattedSettlementReport,
	b: FormattedSettlementReport,
): FormattedSettlementReport {
	return {
		costPrice: a.costPrice + b.costPrice,
		principal: a.principal + b.principal,
		principalTax: a.principalTax + b.principalTax,
		shipping: a.shipping + b.shipping,
		shippingTax: a.shippingTax + b.shippingTax,
		refund: a.refund + b.refund,
		promotion: a.promotion + b.promotion,
		commissionFee: a.commissionFee + b.commissionFee,
		fbaShippingFee: a.fbaShippingFee + b.fbaShippingFee,
		inventoryStorageFee: a.inventoryStorageFee + b.inventoryStorageFee,
		inventoryUpdateFee: a.inventoryUpdateFee + b.inventoryUpdateFee,
		shippingReturnFee: a.shippingReturnFee + b.shippingReturnFee,
		accountSubscriptionFee:
			a.accountSubscriptionFee + b.accountSubscriptionFee,
		accountsReceivable: a.accountsReceivable + b.accountsReceivable,
	};
}

// 損益計算書データ
export function calcPlbsWithTax(
	reportData: Record<string, FormattedSettlementReport>,
	amazonAdsData: AmazonAdsAmount = { amazonAds: 0 }, // todo: ちゃんと実装
	inventoryData: Inventory = { inventoryAssets: 0 },
): PlBsWithTax[] {
	const result: PlBsWithTax[] = Object.values(reportData).map(
		(rowData, i) => {
			const sales: number =
				rowData.principal +
				rowData.shipping +
				rowData.principalTax +
				rowData.shippingTax;
			const plData = calcPlData(sales, rowData, amazonAdsData);

			return {
				...rowData,
				...plData,
				...inventoryData,
				...amazonAdsData,
			};
		},
	);

	return result;
}

export function calcPlbsWithoutTax(
	reportData: Record<string, FormattedSettlementReport>,
	amazonAdsData: AmazonAdsAmount = { amazonAds: 0 },
	inventoryData: Inventory = { inventoryAssets: 0 },
): PlBsWithoutTax[] {
	const result: PlBsWithoutTax[] = Object.values(reportData).map(
		(rowData, i) => {
			const sales: number = rowData.principal + rowData.shipping;
			const plData = calcPlData(sales, rowData, amazonAdsData);
			const taxes = rowData.principalTax + rowData.shippingTax;

			return {
				...plData,
				...inventoryData,
				...amazonAdsData,
				accruedConsumptionTax: taxes,
				outputConsumptionTax: taxes,
			};
		},
	);

	return result;
}

// 損益計算書データ
export function calcPlData(
	sales: number,
	reportData: FormattedSettlementReport,
	amazonAdsData: AmazonAdsAmount,
): PlData {
	// 純売上 = 売上 - 返品額
	const netSales = sales - reportData.refund;
	// 粗利益 = 純売上 - 原価
	const grossProfit = netSales - reportData.costPrice;
	// 販売費および一般管理費
	const sga = calcSellingGeneralAndAdministrativeExpenses(
		reportData,
		amazonAdsData,
	);
	// アマゾンその他 = 売掛金 - (売上 + (販売費および一般管理費 - 広告宣伝費))
	const amazonOther =
		reportData.accountsReceivable -
		(sales + (sga - amazonAdsData.amazonAds));
	// 営業利益
	const operatingProfit = grossProfit - sga;

	return {
		sales,
		netSales,
		grossProfit,
		sga,
		amazonOther,
		operatingProfit,
	};
}

// 販売費および一般管理費
function calcSellingGeneralAndAdministrativeExpenses(
	reportData: FormattedSettlementReport,
	amazonAdsData: AmazonAdsAmount,
) {
	// 販売費および一般管理費 =
	return (
		// 広告宣伝費（Amazon広告）+
		amazonAdsData.amazonAds +
		// プロモーション費用 +
		reportData.promotion +
		// 販売手数料 +
		reportData.commissionFee +
		// FBA出荷手数料 +
		reportData.fbaShippingFee +
		// 在庫保管料 +
		reportData.inventoryStorageFee +
		// 在庫更新費用 +
		reportData.inventoryUpdateFee +
		// 配送返戻金 +
		reportData.shippingReturnFee +
		// アカウント月額登録料
		reportData.accountSubscriptionFee
	);
}
