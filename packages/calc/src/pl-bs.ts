import { type Table, tableFromArrays } from 'apache-arrow';
import type {
	AmazonAdsAmount,
	FilteredSettlementReport,
	PlData,
} from '../types/pl-bs';

// 損益計算書データ
export function calcPlbs(
	reportData: Table,
	amazonAdsData: AmazonAdsAmount,
	withoutTax: boolean,
): Table | null {
	// スキーマ定義してそれが等しいならとかでできそう
	const numRows = reportData.numRows;
	const principalCol = reportData.getChild('principal');
	const principalTaxCol = reportData.getChild('principalTax');
	const shippingCol = reportData.getChild('shipping');
	const shippingTaxCol = reportData.getChild('shippingTax');
	const refundCol = reportData.getChild('refund');
	const promotionCol = reportData.getChild('promotion');
	const commissionFeeCol = reportData.getChild('commissionFee');
	const fbaShippingFeeCol = reportData.getChild('fbaShippingFee');
	const inventoryStorageFeeCol = reportData.getChild('inventoryStorageFee');
	const inventoryUpdateFeeCol = reportData.getChild('inventoryUpdateFee');
	const shippingReturnFeeCol = reportData.getChild('shippingReturnFee');
	const subscriptionFeeCol = reportData.getChild('accountSubscriptionFee');
	const accountsReceivableCol = reportData.getChild('accountsReceivable');
	if (
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

	// 行ごとに計算
	const rows = Array.from({ length: numRows }, (_, i) => {
		const rowData: FilteredSettlementReport = {
			principal: principalCol.get(i),
			principalTax: principalTaxCol.get(i),
			shipping: shippingCol.get(i),
			shippingTax: shippingTaxCol.get(i),
			refund: refundCol.get(i),
			promotion: promotionCol.get(i),
			commissionFee: commissionFeeCol.get(i),
			fbaShippingFee: fbaShippingFeeCol.get(i),
			inventoryStorageFee: inventoryStorageFeeCol.get(i),
			inventoryUpdateFee: inventoryUpdateFeeCol.get(i),
			shippingReturnFee: shippingReturnFeeCol.get(i),
			accountSubscriptionFee: subscriptionFeeCol.get(i),
			accountsReceivable: accountsReceivableCol.get(i),
		};

		// 売上 = 商品代金 + 配送料
		// + 商品代金に対する税金 + 配送料に対する税金(税込みの場合)
		const sales: number =
			rowData.principal +
			rowData.shipping +
			(withoutTax ? 0 : rowData.principalTax + rowData.shippingTax);

		const plData = calcPlData(sales, rowData, amazonAdsData);

		if (withoutTax) {
			const taxes = rowData.principalTax + rowData.shippingTax;
			return {
				taxes,
				...plData,
			};
		}

		return {
			taxes: 0,
			...plData,
		};
	});

	// 各配列にマッピング
	const calcData = {
		sales: rows.map(r => r.sales),
		netSales: rows.map(r => r.netSales),
		costPrice: rows.map(r => r.cost),
		grossProfit: rows.map(r => r.grossProfit),
		sga: rows.map(r => r.sga),
		amazonOther: rows.map(r => r.amazonOther),
		amazonAds: rows.map(r => amazonAdsData.amazonAds),
		operatingProfit: rows.map(r => r.operatingProfit),
		...(withoutTax
			? {
					accruedConsumptionTax: rows.map(r => r.taxes),
					outputConsumptionTax: rows.map(r => r.taxes),
				}
			: {}),
	};

	const calcTable = tableFromArrays(calcData);
	// 元データと計算結果を結合
	return calcTable;
}

// 損益計算書データ
export function calcPlData(
	sales: number,
	reportData: FilteredSettlementReport,
	amazonAdsData: AmazonAdsAmount,
): PlData {
	// 純売上 = 売上 - 返品額
	const netSales = sales - reportData.refund;
	// 原価
	const cost = 0;
	// 粗利益 = 純売上 - 原価
	const grossProfit = netSales - cost;
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
		cost,
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
