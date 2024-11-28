export type InventorySummariesResponse = {
	payload: InventorySummariesPayload;
};

export type InventorySummariesPayload = {
	granularity: 'Marketplace' | string; // TODO: Add more granularities
	granularityId: 'A1VC38T7YXB528' | string; // TODO: Add more granularityIds
	inventorySummaries: InventorySummary[];
};

export type InventorySummary = {
	asin: string;
	fnSku: string;
	sellerSku: string;
	condition: 'NewItem' | string; // TODO: Add more conditions
	lastUpdatedTime: string; // Date
	productName: string;
	totalQuantity: number;
	stores: []; // TODO: Add store type
};
