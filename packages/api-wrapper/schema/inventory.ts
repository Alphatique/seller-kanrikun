import { z } from 'zod';

export const inventorySummary = z.object({
	asin: z.string(),
	fnSku: z.string(),
	sellerSku: z.string(),
	condition: z.string(),
	// inventoryDetails: z.object().optional(),
	// inventoryDetailsはフラグを立てないと出てこないらしいので今回は無視
	lastUpdatedTime: z.coerce.date().optional(),
	productName: z.string(),
	totalQuantity: z.number(),
	stores: z.array(z.string()),
	sellerKanrikunSaveTime: z.coerce.date(),
});
export const inventorySummaries = z.array(inventorySummary);

export type InventorySummary = z.infer<typeof inventorySummary>;
export type InventorySummaries = z.infer<typeof inventorySummaries>;
