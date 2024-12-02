export interface paths {
	'/fba/inventory/v1/summaries': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/** @description Returns a list of inventory summaries. The summaries returned depend on the presence or absence of the startDateTime, sellerSkus and sellerSku parameters:
		 *
		 *     - All inventory summaries with available details are returned when the startDateTime, sellerSkus and sellerSku parameters are omitted.
		 *     - When startDateTime is provided, the operation returns inventory summaries that have had changes after the date and time specified. The sellerSkus and sellerSku parameters are ignored. Important: To avoid errors, use both startDateTime and nextToken to get the next page of inventory summaries that have changed after the date and time specified.
		 *     - When the sellerSkus parameter is provided, the operation returns inventory summaries for only the specified sellerSkus. The sellerSku parameter is ignored.
		 *     - When the sellerSku parameter is provided, the operation returns inventory summaries for only the specified sellerSku.
		 *
		 *     Note: The parameters associated with this operation may contain special characters that must be encoded to successfully call the API. To avoid errors with SKUs when encoding URLs, refer to [URL Encoding](https://developer-docs.amazon.com/sp-api/docs/url-encoding).
		 *
		 *     Usage Plan:
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 2 | 2 |
		 *
		 *     The x-amzn-RateLimit-Limit response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, see [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits). */
		get: operations['getInventorySummaries'];
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	'/fba/inventory/v1/items': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		get?: never;
		put?: never;
		/** @description Requests that Amazon create product-details in the Sandbox Inventory in the sandbox environment. This is a sandbox-only operation and must be directed to a sandbox endpoint. Refer to [Selling Partner API sandbox](https://developer-docs.amazon.com/sp-api/docs/the-selling-partner-api-sandbox) for more information. */
		post: operations['createInventoryItem'];
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	'/fba/inventory/v1/items/{sellerSku}': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		get?: never;
		put?: never;
		post?: never;
		/** @description Requests that Amazon Deletes an item from the Sandbox Inventory in the sandbox environment. This is a sandbox-only operation and must be directed to a sandbox endpoint. Refer to [Selling Partner API sandbox](https://developer-docs.amazon.com/sp-api/docs/the-selling-partner-api-sandbox) for more information. */
		delete: operations['deleteInventoryItem'];
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	'/fba/inventory/v1/items/inventory': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		get?: never;
		put?: never;
		/** @description Requests that Amazon add items to the Sandbox Inventory with desired amount of quantity in the sandbox environment. This is a sandbox-only operation and must be directed to a sandbox endpoint. Refer to [Selling Partner API sandbox](https://developer-docs.amazon.com/sp-api/docs/the-selling-partner-api-sandbox) for more information. */
		post: operations['addInventory'];
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
}
export type webhooks = Record<string, never>;
export interface components {
	schemas: {
		/** @description An item to be created in the inventory. */
		CreateInventoryItemRequest: {
			/** @description The seller SKU of the item. */
			sellerSku: string;
			/** @description The marketplaceId. */
			marketplaceId: string;
			/** @description The name of the item. */
			productName: string;
		};
		/** @description The object with the list of Inventory to be added */
		AddInventoryRequest: {
			inventoryItems?: components['schemas']['InventoryItems'];
		};
		/** @description List of Inventory to be added */
		InventoryItems: components['schemas']['InventoryItem'][];
		/** @description An item in the list of inventory to be added. */
		InventoryItem: {
			/** @description The seller SKU of the item. */
			sellerSku: string;
			/** @description The marketplaceId. */
			marketplaceId: string;
			/** @description The quantity of item to add. */
			quantity: number;
		};
		/** @description The response schema for the CreateInventoryItem operation. */
		CreateInventoryItemResponse: {
			errors?: components['schemas']['ErrorList'];
		};
		/** @description The response schema for the DeleteInventoryItem operation. */
		DeleteInventoryItemResponse: {
			errors?: components['schemas']['ErrorList'];
		};
		/** @description The response schema for the AddInventory operation. */
		AddInventoryResponse: {
			errors?: components['schemas']['ErrorList'];
		};
		/** @description Describes a granularity at which inventory data can be aggregated. For example, if you use Marketplace granularity, the fulfillable quantity will reflect inventory that could be fulfilled in the given marketplace. */
		Granularity: {
			/** @description The granularity type for the inventory aggregation level. */
			granularityType?: string;
			/** @description The granularity ID for the specified granularity type. When granularityType is Marketplace, specify the marketplaceId. */
			granularityId?: string;
		};
		/** @description The quantity of reserved inventory. */
		ReservedQuantity: {
			/** @description The total number of units in Amazon's fulfillment network that are currently being picked, packed, and shipped; or are sidelined for measurement, sampling, or other internal processes. */
			totalReservedQuantity?: number;
			/** @description The number of units reserved for customer orders. */
			pendingCustomerOrderQuantity?: number;
			/** @description The number of units being transferred from one fulfillment center to another. */
			pendingTransshipmentQuantity?: number;
			/** @description The number of units that have been sidelined at the fulfillment center for additional processing. */
			fcProcessingQuantity?: number;
		};
		/** @description The misplaced or warehouse damaged inventory that is actively being confirmed at our fulfillment centers. */
		ResearchingQuantityEntry: {
			/**
			 * @description The duration of the research.
			 * @enum {string}
			 */
			name:
				| 'researchingQuantityInShortTerm'
				| 'researchingQuantityInMidTerm'
				| 'researchingQuantityInLongTerm';
			/** @description The number of units. */
			quantity: number;
		};
		/** @description The number of misplaced or warehouse damaged units that are actively being confirmed at our fulfillment centers. */
		ResearchingQuantity: {
			/** @description The total number of units currently being researched in Amazon's fulfillment network. */
			totalResearchingQuantity?: number;
			/** @description A list of quantity details for items currently being researched. */
			researchingQuantityBreakdown?: components['schemas']['ResearchingQuantityEntry'][];
		};
		/** @description The quantity of unfulfillable inventory. */
		UnfulfillableQuantity: {
			/** @description The total number of units in Amazon's fulfillment network in unsellable condition. */
			totalUnfulfillableQuantity?: number;
			/** @description The number of units in customer damaged disposition. */
			customerDamagedQuantity?: number;
			/** @description The number of units in warehouse damaged disposition. */
			warehouseDamagedQuantity?: number;
			/** @description The number of units in distributor damaged disposition. */
			distributorDamagedQuantity?: number;
			/** @description The number of units in carrier damaged disposition. */
			carrierDamagedQuantity?: number;
			/** @description The number of units in defective disposition. */
			defectiveQuantity?: number;
			/** @description The number of units in expired disposition. */
			expiredQuantity?: number;
		};
		/** @description Summarized inventory details. This object will not appear if the details parameter in the request is false. */
		InventoryDetails: {
			/** @description The item quantity that can be picked, packed, and shipped. */
			fulfillableQuantity?: number;
			/** @description The number of units in an inbound shipment for which you have notified Amazon. */
			inboundWorkingQuantity?: number;
			/** @description The number of units in an inbound shipment that you have notified Amazon about and have provided a tracking number. */
			inboundShippedQuantity?: number;
			/** @description The number of units that have not yet been received at an Amazon fulfillment center for processing, but are part of an inbound shipment with some units that have already been received and processed. */
			inboundReceivingQuantity?: number;
			reservedQuantity?: components['schemas']['ReservedQuantity'];
			researchingQuantity?: components['schemas']['ResearchingQuantity'];
			unfulfillableQuantity?: components['schemas']['UnfulfillableQuantity'];
		};
		/** @description Inventory summary for a specific item. */
		InventorySummary: {
			/** @description The Amazon Standard Identification Number (ASIN) of an item. */
			asin?: string;
			/** @description Amazon's fulfillment network SKU identifier. */
			fnSku?: string;
			/** @description The seller SKU of the item. */
			sellerSku?: string;
			/** @description The condition of the item as described by the seller (for example, New Item). */
			condition?: string;
			inventoryDetails?: components['schemas']['InventoryDetails'];
			/**
			 * Format: date-time
			 * @description The date and time that any quantity was last updated.
			 */
			lastUpdatedTime?: string;
			/** @description The localized language product title of the item within the specific marketplace. */
			productName?: string;
			/** @description The total number of units in an inbound shipment or in Amazon fulfillment centers. */
			totalQuantity?: number;
			/** @description A list of seller-enrolled stores that apply to this seller SKU. */
			stores?: string[];
		};
		/** @description A list of inventory summaries. */
		InventorySummaries: components['schemas']['InventorySummary'][];
		/** @description The process of returning the results to a request in batches of a defined size called pages. This is done to exercise some control over result size and overall throughput. It's a form of traffic management. */
		Pagination: {
			/** @description A generated string used to retrieve the next page of the result. If nextToken is returned, pass the value of nextToken to the next request. If nextToken is not returned, there are no more items to return. */
			nextToken?: string;
		};
		/** @description The payload schema for the getInventorySummaries operation. */
		GetInventorySummariesResult: {
			granularity: components['schemas']['Granularity'];
			inventorySummaries: components['schemas']['InventorySummaries'];
		};
		/** @description The Response schema. */
		GetInventorySummariesResponse: {
			payload?: components['schemas']['GetInventorySummariesResult'];
			pagination?: components['schemas']['Pagination'];
			errors?: components['schemas']['ErrorList'];
		};
		/** @description An error response returned when the request is unsuccessful. */
		Error: {
			/** @description An error code that identifies the type of error that occurred. */
			code: string;
			/** @description A message that describes the error condition in a human-readable form. */
			message?: string;
			/** @description Additional information that can help the caller understand or fix the issue. */
			details?: string;
		};
		/** @description A list of error responses returned when a request is unsuccessful. */
		ErrorList: components['schemas']['Error'][];
	};
	responses: never;
	parameters: never;
	requestBodies: never;
	headers: never;
	pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
	getInventorySummaries: {
		parameters: {
			query: {
				/** @description true to return inventory summaries with additional summarized inventory details and quantities. Otherwise, returns inventory summaries only (default value). */
				details?: boolean;
				/** @description The granularity type for the inventory aggregation level. */
				granularityType: 'Marketplace';
				/** @description The granularity ID for the inventory aggregation level. */
				granularityId: string;
				/** @description A start date and time in ISO8601 format. If specified, all inventory summaries that have changed since then are returned. You must specify a date and time that is no earlier than 18 months prior to the date and time when you call the API. Note: Changes in inboundWorkingQuantity, inboundShippedQuantity and inboundReceivingQuantity are not detected. */
				startDateTime?: string;
				/** @description A list of seller SKUs for which to return inventory summaries. You may specify up to 50 SKUs. */
				sellerSkus?: string[];
				/** @description A single seller SKU used for querying the specified seller SKU inventory summaries. */
				sellerSku?: string;
				/** @description String token returned in the response of your previous request. The string token will expire 30 seconds after being created. */
				nextToken?: string;
				/** @description The marketplace ID for the marketplace for which to return inventory summaries. */
				marketplaceIds: string[];
			};
			header?: never;
			path?: never;
			cookie?: never;
		};
		requestBody?: never;
		responses: {
			/** @description OK */
			200: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['GetInventorySummariesResponse'];
				};
			};
			/** @description Request has missing or invalid parameters and cannot be parsed. */
			400: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['GetInventorySummariesResponse'];
				};
			};
			/** @description Indicates access to the resource is forbidden. Possible reasons include Access Denied, Unauthorized, Expired Token, Invalid Signature or Resource Not Found. */
			403: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['GetInventorySummariesResponse'];
				};
			};
			/** @description The specified resource does not exist. */
			404: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['GetInventorySummariesResponse'];
				};
			};
			/** @description The frequency of requests was greater than allowed. */
			429: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['GetInventorySummariesResponse'];
				};
			};
			/** @description An unexpected condition occurred that prevented the server from fulfilling the request. */
			500: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['GetInventorySummariesResponse'];
				};
			};
			/** @description Temporary overloading or maintenance of the server. */
			503: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['GetInventorySummariesResponse'];
				};
			};
		};
	};
	createInventoryItem: {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/** @description CreateInventoryItem Request Body Parameter. */
		requestBody: {
			content: {
				'application/json': components['schemas']['CreateInventoryItemRequest'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateInventoryItemResponse'];
				};
			};
			/** @description Request has missing or invalid parameters and cannot be parsed. */
			400: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateInventoryItemResponse'];
				};
			};
			/** @description Indicates access to the resource is forbidden. Possible reasons include Access Denied, Unauthorized, Expired Token, Invalid Signature or Resource Not Found. */
			403: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateInventoryItemResponse'];
				};
			};
			/** @description The specified resource does not exist. */
			404: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateInventoryItemResponse'];
				};
			};
			/** @description The frequency of requests was greater than allowed. */
			429: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateInventoryItemResponse'];
				};
			};
			/** @description An unexpected condition occurred that prevented the server from fulfilling the request. */
			500: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateInventoryItemResponse'];
				};
			};
			/** @description Temporary overloading or maintenance of the server. */
			503: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateInventoryItemResponse'];
				};
			};
		};
	};
	deleteInventoryItem: {
		parameters: {
			query: {
				/** @description The marketplace ID for the marketplace for which the sellerSku is to be deleted. */
				marketplaceId: string;
			};
			header?: never;
			path: {
				/** @description A single seller SKU used for querying the specified seller SKU inventory summaries. */
				sellerSku: string;
			};
			cookie?: never;
		};
		requestBody?: never;
		responses: {
			/** @description OK */
			200: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['DeleteInventoryItemResponse'];
				};
			};
			/** @description Request has missing or invalid parameters and cannot be parsed. */
			400: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['DeleteInventoryItemResponse'];
				};
			};
			/** @description Indicates access to the resource is forbidden. Possible reasons include Access Denied, Unauthorized, Expired Token, Invalid Signature or Resource Not Found. */
			403: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['DeleteInventoryItemResponse'];
				};
			};
			/** @description The specified resource does not exist. */
			404: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['DeleteInventoryItemResponse'];
				};
			};
			/** @description The frequency of requests was greater than allowed. */
			429: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['DeleteInventoryItemResponse'];
				};
			};
			/** @description An unexpected condition occurred that prevented the server from fulfilling the request. */
			500: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['DeleteInventoryItemResponse'];
				};
			};
			/** @description Temporary overloading or maintenance of the server. */
			503: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['DeleteInventoryItemResponse'];
				};
			};
		};
	};
	addInventory: {
		parameters: {
			query?: never;
			header: {
				/** @description A unique token/requestId provided with each call to ensure idempotency. */
				'x-amzn-idempotency-token': string;
			};
			path?: never;
			cookie?: never;
		};
		/** @description List of items to add to Sandbox inventory. */
		requestBody: {
			content: {
				'application/json': components['schemas']['AddInventoryRequest'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['AddInventoryResponse'];
				};
			};
			/** @description Request has missing or invalid parameters and cannot be parsed. */
			400: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['AddInventoryResponse'];
				};
			};
			/** @description Indicates access to the resource is forbidden. Possible reasons include Access Denied, Unauthorized, Expired Token, Invalid Signature or Resource Not Found. */
			403: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['AddInventoryResponse'];
				};
			};
			/** @description The specified resource does not exist. */
			404: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['AddInventoryResponse'];
				};
			};
			/** @description The frequency of requests was greater than allowed. */
			429: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['AddInventoryResponse'];
				};
			};
			/** @description An unexpected condition occurred that prevented the server from fulfilling the request. */
			500: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['AddInventoryResponse'];
				};
			};
			/** @description Temporary overloading or maintenance of the server. */
			503: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['AddInventoryResponse'];
				};
			};
		};
	};
}
