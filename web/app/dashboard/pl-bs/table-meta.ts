type PlbsTableMetaData = {
	key: string;
	head: string;
	indent: number;
	underLine?: boolean;
	doubleUnderLine?: boolean;
};

export const plTableWithTax: PlbsTableMetaData[] = [
	{
		key: 'sales',
		head: '売上',
		indent: 1,
	},
	{
		key: 'principal',
		head: '商品代金',
		indent: 2,
	},
	{
		key: 'principalTax',
		head: '消費税',
		indent: 2,
	},
	{
		key: 'shipping',
		head: '送料',
		indent: 2,
	},
	{
		key: 'shippingTax',
		head: '消費税',
		indent: 2,
	},
	{
		key: 'refund',
		head: '返品額',
		indent: 1,
	},
	{
		key: 'netSales',
		head: '純売上',
		indent: 1,
	},
	{
		key: 'costPrice',
		head: '原価',
		indent: 1,
	},
	{
		key: 'grossProfit',
		head: '粗利益',
		indent: 1,
		underLine: true,
	},
	{
		key: 'sga',
		head: '販売費および一般管理費',
		indent: 1,
	},
	{
		key: 'amazonAds',
		head: '広告宣伝費(Amazon広告)',
		indent: 2,
	},
	{
		key: 'promotion',
		head: 'プロモーション費用',
		indent: 2,
	},
	{
		key: 'salesCommission',
		head: '販売手数料',
		indent: 2,
	},
	{
		key: 'fbaShippingFee',
		head: 'FBA出荷手数料',
		indent: 2,
	},
	{
		key: 'inventoryStorageFee',
		head: '在庫保管料',
		indent: 2,
	},
	{
		key: 'inventoryUpdateFee',
		head: '在庫更新費用',
		indent: 2,
	},
	{
		key: 'shippingReturnFee',
		head: '配送返戻金',
		indent: 2,
	},
	{
		key: 'subscriptionFee',
		head: 'アカウント月額登録料',
		indent: 2,
	},
	{
		key: 'amazonOther',
		head: 'Amazonその他',
		indent: 1,
		doubleUnderLine: true,
	},
	{
		key: 'operatingProfit',
		head: '営業利益',
		indent: 1,
	},
];
export const plTableWithoutTax: PlbsTableMetaData[] = [
	{
		key: 'sales',
		head: '売上',
		indent: 1,
	},
	{
		key: 'principal',
		head: '商品代金',
		indent: 2,
	},
	{
		key: 'shipping',
		head: '送料',
		indent: 2,
	},
	{
		key: 'refund',
		head: '返品額',
		indent: 1,
	},
	{
		key: 'netSales',
		head: '純売上',
		indent: 1,
	},
	{
		key: 'costPrice',
		head: '原価',
		indent: 1,
	},
	{
		key: 'grossProfit',
		head: '粗利益',
		indent: 1,
		underLine: true,
	},
	{
		key: 'sga',
		head: '販売費および一般管理費',
		indent: 1,
	},
	{
		key: 'amazonAds',
		head: '広告宣伝費(Amazon広告)',
		indent: 2,
	},
	{
		key: 'promotion',
		head: 'プロモーション費用',
		indent: 2,
	},
	{
		key: 'salesCommission',
		head: '販売手数料',
		indent: 2,
	},
	{
		key: 'fbaShippingFee',
		head: 'FBA出荷手数料',
		indent: 2,
	},
	{
		key: 'inventoryStorageFee',
		head: '在庫保管料',
		indent: 2,
	},
	{
		key: 'inventoryUpdateFee',
		head: '在庫更新費用',
		indent: 2,
	},
	{
		key: 'shippingReturnFee',
		head: '配送返戻金',
		indent: 2,
	},
	{
		key: 'subscriptionFee',
		head: 'アカウント月額登録料',
		indent: 2,
	},
	{
		key: 'amazonOther',
		head: 'Amazonその他',
		indent: 1,
		doubleUnderLine: true,
	},
	{
		key: 'operatingProfit',
		head: '営業利益',
		indent: 1,
	},
];

export const indexTable: PlbsTableMetaData[] = [
	{
		key: 'grossProfitRate',
		head: '粗利率',
		indent: 1,
	},
	{
		key: 'AdvertisingExpenses',
		head: '広告宣伝費',
		indent: 1,
	},
	{
		key: 'salesCommission',
		head: '販売手数料',
		indent: 1,
	},
	{
		key: 'FBAShippingFeeRate',
		head: 'FBA配送手数料率',
		indent: 1,
	},
];

export const bsTableWithTax: PlbsTableMetaData[] = [
	{
		key: 'unpaidBalance',
		head: '売掛金(未入金額)',
		indent: 1,
	},
	{
		key: 'inventoryAssets',
		head: '棚卸資産',
		indent: 1,
	},
];

export const bsTableWithoutTax: PlbsTableMetaData[] = [
	{
		key: 'inventoryAssets',
		head: '棚卸資産',
		indent: 1,
	},
	{
		key: 'accruedConsumptionTax',
		head: '未収消費税',
		indent: 1,
	},
	{
		key: 'temporarilyReceivedConsumptionTax',
		head: '未収消費税',
		indent: 1,
	},
];