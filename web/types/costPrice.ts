export type CostPrice = {
	ASIN: string;
	Price: number;
};

export type UpdateCostPriceRequest = {
	userId: string;
	date: {
		from: Date;
		to: Date;
	};
	data: CostPrice[];
};
