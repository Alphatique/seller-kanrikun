import { z } from 'zod';

export const costPriceSchema = z.array(
	z.object({
		asin: z.string(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date(),
		price: z.number(),
	}),
);
export type CostPrice = z.infer<typeof costPriceSchema>;

export const updateCostPriceRequestSchema = z.object({
	date: z.object({
		from: z.date(),
		to: z.date(),
	}),
	data: z.array(
		z.object({
			asin: z.string(),
			price: z.number(),
		}),
	),
});

export type UpdateCostPriceRequest = z.infer<
	typeof updateCostPriceRequestSchema
>;

export type SkuOrder = {
	sku: string;
	'quantity-purchased': number;
};
