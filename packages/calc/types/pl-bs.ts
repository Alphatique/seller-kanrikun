/**
 * settlement-reportをフィルタリングしたデータ
 * @property costPrice 商品原価
 * @property principal 商品代金
 * @property principalTax 商品代金に対する税金
 * @property shipping 配送料
 * @property shippingTax 配送料に対する税金
 * @property refund 返品額
 * @property promotion プロモーション費用
 * @property commissionFee 販売手数料
 * @property fbaShippingFee FBA手数料
 * @property inventoryStorageFee 在庫保管料
 * @property inventoryUpdateFee 在庫更新費用
 * @property shippingReturnFee 配送返戻金
 * @property accountSubscriptionFee アカウント月額料金
 * @property accountsReceivable 売掛金
 */
export interface FilteredSettlementReport {
	/** 商品原価 */
	costPrice: number;
	/** 商品代金 */
	principal: number;
	/** 商品代金に対する税金 */
	principalTax: number;
	/** 配送料 */
	shipping: number;
	/** 配送料に対する税金 */
	shippingTax: number;
	/** 返品額 */
	refund: number;
	/** プロモーション費用 */
	promotion: number;
	/** 販売手数料 */
	commissionFee: number;
	/** FBA手数料 */
	fbaShippingFee: number;
	/** 在庫保管料 */
	inventoryStorageFee: number;
	/** 在庫更新費用 */
	inventoryUpdateFee: number;
	/** 配送返戻金 */
	shippingReturnFee: number;
	/** アカウント月額料金 */
	accountSubscriptionFee: number;
	/** 売掛金 */
	accountsReceivable: number;
}

/**
 * アマゾン広告のデータ
 * @property amazonAds 広告費用(Amazon広告)
 */
export interface AmazonAdsAmount {
	/** 広告費用(Amazon広告) */
	amazonAds: number;
}

/**
 * 棚卸資産
 * @property inventory 棚卸資産
 */
export interface Inventory {
	/** 棚卸資産 */
	inventory: number;
}

/**
 * 損益計算書データ
 * @property sales 売上
 * @property netSales 純売上
 * @property grossProfit 粗利益
 * @property sga 販売費および一般管理費
 * @property amazonOther アマゾンその他
 * @property operatingIncome 営業利益
 * @property tax 税金合計
 */
export interface PlData {
	/** 売上 */
	sales: number;
	/** 純売上 */
	netSales: number;
	/** 粗利益 */
	grossProfit: number;
	/** 販売費および一般管理費 */
	sga: number;
	/** アマゾンその他 */
	amazonOther: number;
	/** 営業利益 */
	operatingProfit: number;
	/** 税金合計 */
	tax?: number;
}

/**
 * 損益計算書データ(税込)
 * @property AccruedConsumptionTax 未収消費税
 * @property outputConsumptionTax 仮受消費税
 */
export interface BsWithoutTax {
	/** 未収消費税 */
	accruedConsumptionTax: number;
	/** 仮受消費税 */
	outputConsumptionTax: number;
}
