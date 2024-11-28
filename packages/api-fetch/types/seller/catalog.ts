export type CatalogItemsResponse = {
	numberOfResults: number;
	items: CatalogItem[];
};

export type CatalogItem = {
	asin: string;
	summaries: CatalogItemSummary[];
};

export type CatalogItemSummary = {
	marketplaceId: string;
	adultProduct: boolean;
	autographed: boolean;
	brand: string;
	browseClassification: {
		displayName: string;
		classificationId: number;
	};
	color: string;
	itemClassification: string;
	itemName: string;
	manufacturer: string;
	memorabilia: boolean;
	modelNumber: string;
	partNumber: string;
	tradeInEligible: boolean;
	websiteDisplayGroup: string;
	websiteDisplayGroupName: string;
};
