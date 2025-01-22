import { z } from 'zod';

export const catalogSummary = z.object({
	marketplaceId: z.string(),
	adultProduct: z.boolean(),
	autographed: z.boolean(),
	brand: z.string(),
	browseClassification: z.object({
		displayName: z.string(),
		classificationId: z.string(),
	}),
	color: z.string(),
	itemClassification: z.string(),
	itemName: z.string(),
	manufacturer: z.string(),
	memorabilia: z.boolean(),
	modelNumber: z.string(),
	partNumber: z.string(),
	tradeInEligible: z.boolean(),
	websiteDisplayGroup: z.string(),
	websiteDisplayGroupName: z.string(),
	sellerKanrikunSaveTime: z.coerce.date(),
});
export const catalogSummaries = z.array(catalogSummary);

export type CatalogSummary = z.infer<typeof catalogSummary>;
export type CatalogSummaries = z.infer<typeof catalogSummaries>;
