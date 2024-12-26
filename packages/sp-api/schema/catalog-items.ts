export interface paths {
	'/catalog/2022-04-01/items': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/**
		 * searchCatalogItems
		 * @description Search for and return a list of Amazon catalog items and associated information either by identifier or by keywords.
		 *
		 *     **Usage Plans:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 2 | 2 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may observe higher rate and burst values than those shown here. For more information, refer to the [Usage Plans and Rate Limits in the Selling Partner API](doc:usage-plans-and-rate-limits-in-the-sp-api).
		 */
		get: operations['searchCatalogItems'];
		put?: never;
		post?: never;
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	'/catalog/2022-04-01/items/{asin}': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/**
		 * getCatalogItem
		 * @description Retrieves details for an item in the Amazon catalog.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 2 | 2 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may observe higher rate and burst values than those shown here. For more information, refer to the [Usage Plans and Rate Limits in the Selling Partner API](doc:usage-plans-and-rate-limits-in-the-sp-api).
		 */
		get: operations['getCatalogItem'];
		put?: never;
		post?: never;
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
		/** @description Error response returned when the request is unsuccessful. */
		Error: {
			/** @description An error code that identifies the type of error that occurred. */
			code: string;
			/** @description A message that describes the error condition. */
			message: string;
			/** @description Additional details that can help the caller understand or fix the issue. */
			details?: string;
		};
		/** @description A list of error responses returned when a request is unsuccessful. */
		ErrorList: {
			errors: components['schemas']['Error'][];
		};
		/** @description An item in the Amazon catalog. */
		Item: {
			asin: components['schemas']['ItemAsin'];
			attributes?: components['schemas']['ItemAttributes'];
			classifications?: components['schemas']['ItemBrowseClassifications'];
			dimensions?: components['schemas']['ItemDimensions'];
			identifiers?: components['schemas']['ItemIdentifiers'];
			images?: components['schemas']['ItemImages'];
			productTypes?: components['schemas']['ItemProductTypes'];
			relationships?: components['schemas']['ItemRelationships'];
			salesRanks?: components['schemas']['ItemSalesRanks'];
			summaries?: components['schemas']['ItemSummaries'];
			vendorDetails?: components['schemas']['ItemVendorDetails'];
		};
		/** @description Amazon Standard Identification Number (ASIN) is the unique identifier for an item in the Amazon catalog. */
		ItemAsin: string;
		/** @description A JSON object that contains structured item attribute data keyed by attribute name. Catalog item attributes conform to the related product type definitions available in the Selling Partner API for Product Type Definitions. */
		ItemAttributes: {
			[key: string]: unknown;
		};
		/** @description Classification (browse node) associated with an Amazon catalog item. */
		ItemBrowseClassification: {
			/** @description Display name for the classification (browse node). */
			displayName: string;
			/** @description Identifier of the classification (browse node identifier). */
			classificationId: string;
			parent?: components['schemas']['ItemBrowseClassification'];
		};
		/** @description Individual contributor to the creation of an item, such as an author or actor. */
		ItemContributor: {
			role: components['schemas']['ItemContributorRole'];
			/** @description Name of the contributor, such as Jane Austen. */
			value: string;
		};
		/** @description Role of an individual contributor in the creation of an item, such as author or actor. */
		ItemContributorRole: {
			/** @description Display name of the role in the requested locale, such as Author or Actor. */
			displayName?: string;
			/** @description Role value for the Amazon catalog item, such as author or actor. */
			value: string;
		};
		/** @description Array of classifications (browse nodes) associated with the item in the Amazon catalog by Amazon marketplace. */
		ItemBrowseClassifications: components['schemas']['ItemBrowseClassificationsByMarketplace'][];
		/** @description Classifications (browse nodes) associated with the item in the Amazon catalog for the indicated Amazon marketplace. */
		ItemBrowseClassificationsByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId: string;
			/** @description Classifications (browse nodes) associated with the item in the Amazon catalog for the indicated Amazon marketplace. */
			classifications?: components['schemas']['ItemBrowseClassification'][];
		};
		/** @description Individual dimension value of an Amazon catalog item or item package. */
		Dimension: {
			/** @description Measurement unit of the dimension value. */
			unit?: string;
			/** @description Numeric dimension value. */
			value?: number;
		};
		/** @description Dimensions of an Amazon catalog item or item in its packaging. */
		Dimensions: {
			height?: components['schemas']['Dimension'];
			length?: components['schemas']['Dimension'];
			weight?: components['schemas']['Dimension'];
			width?: components['schemas']['Dimension'];
		};
		/** @description Array of dimensions associated with the item in the Amazon catalog by Amazon marketplace. */
		ItemDimensions: components['schemas']['ItemDimensionsByMarketplace'][];
		/** @description Dimensions associated with the item in the Amazon catalog for the indicated Amazon marketplace. */
		ItemDimensionsByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId: string;
			item?: components['schemas']['Dimensions'];
			package?: components['schemas']['Dimensions'];
		};
		/** @description Identifiers associated with the item in the Amazon catalog, such as UPC and EAN identifiers. */
		ItemIdentifiers: components['schemas']['ItemIdentifiersByMarketplace'][];
		/** @description Identifiers associated with the item in the Amazon catalog for the indicated Amazon marketplace. */
		ItemIdentifiersByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId: string;
			/** @description Identifiers associated with the item in the Amazon catalog for the indicated Amazon marketplace. */
			identifiers: components['schemas']['ItemIdentifier'][];
		};
		/** @description Identifier associated with the item in the Amazon catalog, such as a UPC or EAN identifier. */
		ItemIdentifier: {
			/** @description Type of identifier, such as UPC, EAN, or ISBN. */
			identifierType: string;
			/** @description Identifier. */
			identifier: string;
		};
		/** @description Images for an item in the Amazon catalog. */
		ItemImages: components['schemas']['ItemImagesByMarketplace'][];
		/** @description Images for an item in the Amazon catalog for the indicated Amazon marketplace. */
		ItemImagesByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId: string;
			/** @description Images for an item in the Amazon catalog for the indicated Amazon marketplace. */
			images: components['schemas']['ItemImage'][];
		};
		/** @description Image for an item in the Amazon catalog. */
		ItemImage: {
			/**
			 * @description Variant of the image, such as `MAIN` or `PT01`.
			 * @example MAIN
			 * @enum {string}
			 */
			variant:
				| 'MAIN'
				| 'PT01'
				| 'PT02'
				| 'PT03'
				| 'PT04'
				| 'PT05'
				| 'PT06'
				| 'PT07'
				| 'PT08'
				| 'SWCH';
			/** @description Link, or URL, for the image. */
			link: string;
			/** @description Height of the image in pixels. */
			height: number;
			/** @description Width of the image in pixels. */
			width: number;
		};
		/** @description Product types associated with the Amazon catalog item. */
		ItemProductTypes: components['schemas']['ItemProductTypeByMarketplace'][];
		/** @description Product type associated with the Amazon catalog item for the indicated Amazon marketplace. */
		ItemProductTypeByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId?: string;
			/**
			 * @description Name of the product type associated with the Amazon catalog item.
			 * @example LUGGAGE
			 */
			productType?: string;
		};
		/** @description Sales ranks of an Amazon catalog item. */
		ItemSalesRanks: components['schemas']['ItemSalesRanksByMarketplace'][];
		/** @description Sales ranks of an Amazon catalog item for the indicated Amazon marketplace. */
		ItemSalesRanksByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId: string;
			/** @description Sales ranks of an Amazon catalog item for an Amazon marketplace by classification. */
			classificationRanks?: components['schemas']['ItemClassificationSalesRank'][];
			/** @description Sales ranks of an Amazon catalog item for an Amazon marketplace by website display group. */
			displayGroupRanks?: components['schemas']['ItemDisplayGroupSalesRank'][];
		};
		/** @description Sales rank of an Amazon catalog item by classification. */
		ItemClassificationSalesRank: {
			/** @description Identifier of the classification associated with the sales rank. */
			classificationId: string;
			/** @description Title, or name, of the sales rank. */
			title: string;
			/** @description Corresponding Amazon retail website link, or URL, for the sales rank. */
			link?: string;
			/** @description Sales rank value. */
			rank: number;
		};
		/** @description Sales rank of an Amazon catalog item by website display group. */
		ItemDisplayGroupSalesRank: {
			/** @description Name of the website display group associated with the sales rank */
			websiteDisplayGroup: string;
			/** @description Title, or name, of the sales rank. */
			title: string;
			/** @description Corresponding Amazon retail website link, or URL, for the sales rank. */
			link?: string;
			/** @description Sales rank value. */
			rank: number;
		};
		/** @description Summary details of an Amazon catalog item. */
		ItemSummaries: components['schemas']['ItemSummaryByMarketplace'][];
		/** @description Summary details of an Amazon catalog item for the indicated Amazon marketplace. */
		ItemSummaryByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId: string;
			/** @description Identifies an Amazon catalog item is intended for an adult audience or is sexual in nature. */
			adultProduct?: boolean;
			/** @description Identifies an Amazon catalog item is autographed by a player or celebrity. */
			autographed?: boolean;
			/** @description Name of the brand associated with an Amazon catalog item. */
			brand?: string;
			browseClassification?: components['schemas']['ItemBrowseClassification'];
			/** @description Name of the color associated with an Amazon catalog item. */
			color?: string;
			/** @description Individual contributors to the creation of an item, such as the authors or actors. */
			contributors?: components['schemas']['ItemContributor'][];
			/**
			 * @description Classification type associated with the Amazon catalog item.
			 * @enum {string}
			 */
			itemClassification?:
				| 'BASE_PRODUCT'
				| 'OTHER'
				| 'PRODUCT_BUNDLE'
				| 'VARIATION_PARENT';
			/** @description Name, or title, associated with an Amazon catalog item. */
			itemName?: string;
			/** @description Name of the manufacturer associated with an Amazon catalog item. */
			manufacturer?: string;
			/** @description Identifies an Amazon catalog item is memorabilia valued for its connection with historical events, culture, or entertainment. */
			memorabilia?: boolean;
			/** @description Model number associated with an Amazon catalog item. */
			modelNumber?: string;
			/** @description Quantity of an Amazon catalog item in one package. */
			packageQuantity?: number;
			/** @description Part number associated with an Amazon catalog item. */
			partNumber?: string;
			/**
			 * Format: date
			 * @description First date on which an Amazon catalog item is shippable to customers.
			 */
			releaseDate?: string;
			/** @description Name of the size associated with an Amazon catalog item. */
			size?: string;
			/** @description Name of the style associated with an Amazon catalog item. */
			style?: string;
			/** @description Identifies an Amazon catalog item is eligible for trade-in. */
			tradeInEligible?: boolean;
			/** @description Identifier of the website display group associated with an Amazon catalog item. */
			websiteDisplayGroup?: string;
			/** @description Display name of the website display group associated with an Amazon catalog item. */
			websiteDisplayGroupName?: string;
		};
		/** @description Variation theme indicating the combination of Amazon item catalog attributes that define the variation family. */
		ItemVariationTheme: {
			/** @description Names of the Amazon catalog item attributes associated with the variation theme. */
			attributes?: string[];
			/**
			 * @description Variation theme indicating the combination of Amazon item catalog attributes that define the variation family.
			 * @example COLOR_NAME/STYLE_NAME
			 */
			theme?: string;
		};
		/** @description Relationships by marketplace for an Amazon catalog item (for example, variations). */
		ItemRelationships: components['schemas']['ItemRelationshipsByMarketplace'][];
		/** @description Relationship details for the Amazon catalog item for the indicated Amazon marketplace. */
		ItemRelationshipsByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId: string;
			/** @description Relationships for the item. */
			relationships: components['schemas']['ItemRelationship'][];
		};
		/** @description Relationship details for an Amazon catalog item. */
		ItemRelationship: {
			/** @description Identifiers (ASINs) of the related items that are children of this item. */
			childAsins?: string[];
			/** @description Identifiers (ASINs) of the related items that are parents of this item. */
			parentAsins?: string[];
			variationTheme?: components['schemas']['ItemVariationTheme'];
			/**
			 * @description Type of relationship.
			 * @example VARIATION
			 * @enum {string}
			 */
			type: 'VARIATION' | 'PACKAGE_HIERARCHY';
		};
		/** @description Product category or subcategory associated with an Amazon catalog item. */
		ItemVendorDetailsCategory: {
			/** @description Display name of the product category or subcategory */
			displayName?: string;
			/** @description Value (code) of the product category or subcategory. */
			value?: string;
		};
		/** @description Vendor details associated with an Amazon catalog item. Vendor details are available to vendors only. */
		ItemVendorDetails: components['schemas']['ItemVendorDetailsByMarketplace'][];
		/** @description Vendor details associated with an Amazon catalog item for the indicated Amazon marketplace. */
		ItemVendorDetailsByMarketplace: {
			/** @description Amazon marketplace identifier. */
			marketplaceId: string;
			/** @description Brand code associated with an Amazon catalog item. */
			brandCode?: string;
			/** @description Manufacturer code associated with an Amazon catalog item. */
			manufacturerCode?: string;
			/** @description Parent vendor code of the manufacturer code. */
			manufacturerCodeParent?: string;
			productCategory?: components['schemas']['ItemVendorDetailsCategory'];
			/** @description Product group associated with an Amazon catalog item. */
			productGroup?: string;
			productSubcategory?: components['schemas']['ItemVendorDetailsCategory'];
			/**
			 * @description Replenishment category associated with an Amazon catalog item.
			 * @enum {string}
			 */
			replenishmentCategory?:
				| 'ALLOCATED'
				| 'BASIC_REPLENISHMENT'
				| 'IN_SEASON'
				| 'LIMITED_REPLENISHMENT'
				| 'MANUFACTURER_OUT_OF_STOCK'
				| 'NEW_PRODUCT'
				| 'NON_REPLENISHABLE'
				| 'NON_STOCKUPABLE'
				| 'OBSOLETE'
				| 'PLANNED_REPLENISHMENT';
		};
		/** @description Items in the Amazon catalog and search related metadata. */
		ItemSearchResults: {
			/** @description For `identifiers`-based searches, the total number of Amazon catalog items found. For `keywords`-based searches, the estimated total number of Amazon catalog items matched by the search query (only results up to the page count limit will be returned per request regardless of the number found).
			 *
			 *     Note: The maximum number of items (ASINs) that can be returned and paged through is 1000. */
			numberOfResults: number;
			pagination: components['schemas']['Pagination'];
			refinements: components['schemas']['Refinements'];
			/** @description A list of items from the Amazon catalog. */
			items: components['schemas']['Item'][];
		};
		/** @description When a request produces a response that exceeds the `pageSize`, pagination occurs. This means the response is divided into individual pages. To retrieve the next page or the previous page, you must pass the `nextToken` value or the `previousToken` value as the `pageToken` parameter in the next request. When you receive the last page, there will be no `nextToken` key in the pagination object. */
		Pagination: {
			/** @description A token that can be used to fetch the next page. */
			nextToken?: string;
			/** @description A token that can be used to fetch the previous page. */
			previousToken?: string;
		};
		/** @description Search refinements. */
		Refinements: {
			/** @description Brand search refinements. */
			brands: components['schemas']['BrandRefinement'][];
			/** @description Classification search refinements. */
			classifications: components['schemas']['ClassificationRefinement'][];
		};
		/** @description Description of a brand that can be used to get more fine-grained search results. */
		BrandRefinement: {
			/** @description The estimated number of results that would still be returned if refinement key applied. */
			numberOfResults: number;
			/** @description Brand name. For display and can be used as a search refinement. */
			brandName: string;
		};
		/** @description Description of a classification that can be used to get more fine-grained search results. */
		ClassificationRefinement: {
			/** @description The estimated number of results that would still be returned if refinement key applied. */
			numberOfResults: number;
			/** @description Display name for the classification. */
			displayName: string;
			/** @description Identifier for the classification that can be used for search refinement purposes. */
			classificationId: string;
		};
	};
	responses: never;
	parameters: never;
	requestBodies: never;
	headers: never;
	pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
	searchCatalogItems: {
		parameters: {
			query: {
				/**
				 * @description A comma-delimited list of product identifiers to search the Amazon catalog for. **Note:** Cannot be used with `keywords`.
				 * @example shoes
				 */
				identifiers?: string[];
				/**
				 * @description Type of product identifiers to search the Amazon catalog for. **Note:** Required when `identifiers` are provided.
				 * @example ASIN
				 */
				identifiersType?:
					| 'ASIN'
					| 'EAN'
					| 'GTIN'
					| 'ISBN'
					| 'JAN'
					| 'MINSAN'
					| 'SKU'
					| 'UPC';
				/**
				 * @description A comma-delimited list of Amazon marketplace identifiers for the request.
				 * @example ATVPDKIKX0DER
				 */
				marketplaceIds: string[];
				/**
				 * @description A comma-delimited list of data sets to include in the response. Default: `summaries`.
				 * @example summaries
				 */
				includedData?: (
					| 'attributes'
					| 'classifications'
					| 'dimensions'
					| 'identifiers'
					| 'images'
					| 'productTypes'
					| 'relationships'
					| 'salesRanks'
					| 'summaries'
					| 'vendorDetails'
				)[];
				/**
				 * @description Locale for retrieving localized summaries. Defaults to the primary locale of the marketplace.
				 * @example en_US
				 */
				locale?: string;
				/** @description A selling partner identifier, such as a seller account or vendor code. **Note:** Required when `identifiersType` is `SKU`. */
				sellerId?: string;
				/**
				 * @description A comma-delimited list of words to search the Amazon catalog for. **Note:** Cannot be used with `identifiers`.
				 * @example shoes
				 */
				keywords?: string[];
				/**
				 * @description A comma-delimited list of brand names to limit the search for `keywords`-based queries. **Note:** Cannot be used with `identifiers`.
				 * @example Beautiful Boats
				 */
				brandNames?: string[];
				/**
				 * @description A comma-delimited list of classification identifiers to limit the search for `keywords`-based queries. **Note:** Cannot be used with `identifiers`.
				 * @example 12345678
				 */
				classificationIds?: string[];
				/**
				 * @description Number of results to be returned per page.
				 * @example 9
				 */
				pageSize?: number;
				/**
				 * @description A token to fetch a certain page when there are multiple pages worth of results.
				 * @example sdlkj234lkj234lksjdflkjwdflkjsfdlkj234234234234
				 */
				pageToken?: string;
				/**
				 * @description The language of the keywords provided for `keywords`-based queries. Defaults to the primary locale of the marketplace. **Note:** Cannot be used with `identifiers`.
				 * @example en_US
				 */
				keywordsLocale?: string;
			};
			header?: never;
			path?: never;
			cookie?: never;
		};
		requestBody?: never;
		responses: {
			/** @description Success. */
			200: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ItemSearchResults'];
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description Indicates that access to the resource is forbidden. Possible reasons include Access Denied, Unauthorized, Expired Token, or Invalid Signature. */
			403: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The resource specified does not exist. */
			404: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request size exceeded the maximum accepted size. */
			413: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request payload is in an unsupported format. */
			415: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
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
					'application/json': components['schemas']['ErrorList'];
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
					'application/json': components['schemas']['ErrorList'];
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
		};
	};
	getCatalogItem: {
		parameters: {
			query: {
				/**
				 * @description A comma-delimited list of Amazon marketplace identifiers. Data sets in the response contain data only for the specified marketplaces.
				 * @example ATVPDKIKX0DER
				 */
				marketplaceIds: string[];
				/**
				 * @description A comma-delimited list of data sets to include in the response. Default: `summaries`.
				 * @example summaries
				 */
				includedData?: (
					| 'attributes'
					| 'classifications'
					| 'dimensions'
					| 'identifiers'
					| 'images'
					| 'productTypes'
					| 'relationships'
					| 'salesRanks'
					| 'summaries'
					| 'vendorDetails'
				)[];
				/**
				 * @description Locale for retrieving localized summaries. Defaults to the primary locale of the marketplace.
				 * @example en_US
				 */
				locale?: string;
			};
			header?: never;
			path: {
				/** @description The Amazon Standard Identification Number (ASIN) of the item. */
				asin: string;
			};
			cookie?: never;
		};
		requestBody?: never;
		responses: {
			/** @description Success. */
			200: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['Item'];
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description Indicates that access to the resource is forbidden. Possible reasons include Access Denied, Unauthorized, Expired Token, or Invalid Signature. */
			403: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The resource specified does not exist. */
			404: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request size exceeded the maximum accepted size. */
			413: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request payload is in an unsupported format. */
			415: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
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
					'application/json': components['schemas']['ErrorList'];
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
					'application/json': components['schemas']['ErrorList'];
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
		};
	};
}
