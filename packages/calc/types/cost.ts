import { z } from 'zod';

export const CostPriceSchema = z.object({
	ASIN: z.string(),
	Price: z.number(),
});
export type CostPrice = z.infer<typeof CostPriceSchema>;

export const CostPriceTsvSchema = z.object({
	asin: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	price: z.preprocess(val => {
		const num = Number(val);
		if (Number.isNaN(num)) {
			throw new Error(`Invalid price number: ${val}`);
		}
		return num;
	}, z.number()),
});
export type CostPriceTsv = z.infer<typeof CostPriceTsvSchema>;

export type UpdateCostPriceRequest = {
	userId: string;
	date: {
		from: Date;
		to: Date;
	};
	data: CostPrice[];
};

export type SkuOrder = {
	sku: string;
	'quantity-purchased': number;
};
