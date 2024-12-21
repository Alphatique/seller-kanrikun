import { z } from 'zod';

export const InventorySummarySchema = z.object({
	asin: z.string().nullable(),
	function: z.string().nullable(),
	sellerSku: z.string().nullable(),
	condition: z.string().nullable(),
	inventoryDetails: z.string().nullable(),
	lastUpdatedTime: z.preprocess(val => {
		if (val == null) {
			// val が null または undefined の場合はそのまま返す
			return val;
		}

		const dateStr = String(val);
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) {
			throw new Error(`Invalid date format: ${dateStr}`);
		}

		return d;
	}, z.date().nullish()),
	productName: z.string().nullable(),
	totalQuantity: z.number().nullable(),
	stores: z.array(z.string()).nullable(),
	sellerKanrikunSaveTime: z.date(),
});

export type InventorySummary = z.infer<typeof InventorySummarySchema>;
