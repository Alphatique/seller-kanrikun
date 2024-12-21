import type { Table } from 'apache-arrow';
import type {
	AmazonAdsAmount,
	FilteredSettlementReport,
	Inventory,
	PlBsWithTax,
	PlBsWithoutTax,
	PlData,
} from '../types/pl-bs';

// apache-arrowのまま使いたかったが、schema定義ができなかったので、jsの配列に変換して処理
export function reportArrowTableToArrays(
	reportData: Table,
): FilteredSettlementReport[] | null {
	const dateCol: string[] = reportData.getChild('date')?.toArray();
	const costPrice: number[] = reportData.getChild('costPrice')?.toArray();
	const principalCol: number[] = reportData.getChild('principal')?.toArray();
	const principalTaxCol: number[] = reportData
		.getChild('principalTax')
		?.toArray();
	const shippingCol: number[] = reportData.getChild('shipping')?.toArray();
	const shippingTaxCol: number[] = reportData
		.getChild('shippingTax')
		?.toArray();
	const refundCol: number[] = reportData.getChild('refund')?.toArray();
	const promotionCol: number[] = reportData.getChild('promotion')?.toArray();
	const commissionFeeCol: number[] = reportData
		.getChild('commissionFee')
		?.toArray();
	const fbaShippingFeeCol: number[] = reportData
		.getChild('fbaShippingFee')
		?.toArray();
	const inventoryStorageFeeCol: number[] = reportData
		.getChild('inventoryStorageFee')
		?.toArray();
	const inventoryUpdateFeeCol: number[] = reportData
		.getChild('inventoryUpdateFee')
		?.toArray();
	const shippingReturnFeeCol: number[] = reportData
		.getChild('shippingReturnFee')
		?.toArray();
	const subscriptionFeeCol: number[] = reportData
		.getChild('accountSubscriptionFee')
		?.toArray();
	const accountsReceivableCol = reportData
		.getChild('accountsReceivable')
		?.toArray();
	if (
		!dateCol ||
		!costPrice ||
		!principalCol ||
		!principalTaxCol ||
		!shippingCol ||
		!shippingTaxCol ||
		!refundCol ||
		!promotionCol ||
		!commissionFeeCol ||
		!fbaShippingFeeCol ||
		!inventoryStorageFeeCol ||
		!inventoryUpdateFeeCol ||
		!shippingReturnFeeCol ||
		!subscriptionFeeCol ||
		!accountsReceivableCol
	) {
		console.error('Missing columns in reportData');
		return null;
	}

	const result: FilteredSettlementReport[] = dateCol.map((date, i) => ({
		date: date,
		costPrice: costPrice[i],
		principal: principalCol[i],
		principalTax: principalTaxCol[i],
		shipping: shippingCol[i],
		shippingTax: shippingTaxCol[i],
		refund: refundCol[i],
		promotion: promotionCol[i],
		commissionFee: commissionFeeCol[i],
		fbaShippingFee: fbaShippingFeeCol[i],
		inventoryStorageFee: inventoryStorageFeeCol[i],
		inventoryUpdateFee: inventoryUpdateFeeCol[i],
		shippingReturnFee: shippingReturnFeeCol[i],
		accountSubscriptionFee: subscriptionFeeCol[i],
		accountsReceivable: accountsReceivableCol[i],
	}));

	return result;
}

// 損益計算書データ
export function calcPlbsWithTax(
	reportData: FilteredSettlementReport[],
	amazonAdsData: AmazonAdsAmount = { amazonAds: 0 }, // todo: ちゃんと実装
	inventoryData: Inventory = { inventoryAssets: 0 },
): PlBsWithTax[] {
	const result: PlBsWithTax[] = reportData.map((rowData, i) => {
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
	});

	return result;
}

export function calcPlbsWithoutTax(
	reportData: FilteredSettlementReport[],
	amazonAdsData: AmazonAdsAmount = { amazonAds: 0 },
	inventoryData: Inventory = { inventoryAssets: 0 },
): PlBsWithoutTax[] {
	const result: PlBsWithoutTax[] = reportData.map((rowData, i) => {
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
	});

	return result;
}

// 損益計算書データ
export function calcPlData(
	sales: number,
	reportData: FilteredSettlementReport,
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
	reportData: FilteredSettlementReport,
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
