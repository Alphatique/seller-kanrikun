export type * from './period';

export type PlbsRangedData = {
	start: Date;
	end: Date;
	data: PlbsData[];
};

export type PlbsData = {
	title: string;
	principal: number;
	principalTax: number;
	shipping: number;
	otherTax: number;
	refund: number;
	netSales: number;
	costPrice: number;
	grossProfit: number;
	sga: number;
	amazonAds: number;
	promotion: number;
	salesCommission: number;
	fbaShippingFee: number;
	inventoryStorageFee: number;
	inventoryUpdateFee: number;
	shippingReturnFee: number;
	subscriptionFee: number;
	amazonOther: number;
	operatingProfit: number;
	unpaidBalance: number;
	inventoryAssets: number;
};
