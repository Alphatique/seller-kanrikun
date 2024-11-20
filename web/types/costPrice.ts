export type CostPrice = {
	ASIN: string;
	Price: number;
};

export type UpdateCostPriceRequest = {
	date: {
		from: Date;
		to: Date;
	};
	data: CostPrice[];
};
