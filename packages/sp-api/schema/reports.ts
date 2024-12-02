export interface paths {
	'/reports/2021-06-30/reports': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/**
		 * getReports
		 * @description Returns report details for the reports that match the filters that you specify.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 0.0222 | 10 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		get: operations['getReports'];
		put?: never;
		/**
		 * createReport
		 * @description Creates a report.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 0.0167 | 15 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		post: operations['createReport'];
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	'/reports/2021-06-30/reports/{reportId}': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/**
		 * getReport
		 * @description Returns report details (including the `reportDocumentId`, if available) for the report that you specify.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 2 | 15 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		get: operations['getReport'];
		put?: never;
		post?: never;
		/**
		 * cancelReport
		 * @description Cancels the report that you specify. Only reports with `processingStatus=IN_QUEUE` can be cancelled. Cancelled reports are returned in subsequent calls to the `getReport` and `getReports` operations.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 0.0222 | 10 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		delete: operations['cancelReport'];
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	'/reports/2021-06-30/schedules': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/**
		 * getReportSchedules
		 * @description Returns report schedule details that match the filters that you specify.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 0.0222 | 10 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		get: operations['getReportSchedules'];
		put?: never;
		/**
		 * createReportSchedule
		 * @description Creates a report schedule. If a report schedule with the same report type and marketplace IDs already exists, it will be cancelled and replaced with this one.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 0.0222 | 10 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		post: operations['createReportSchedule'];
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	'/reports/2021-06-30/schedules/{reportScheduleId}': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/**
		 * getReportSchedule
		 * @description Returns report schedule details for the report schedule that you specify.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 0.0222 | 10 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		get: operations['getReportSchedule'];
		put?: never;
		post?: never;
		/**
		 * cancelReportSchedule
		 * @description Cancels the report schedule that you specify.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 0.0222 | 10 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		delete: operations['cancelReportSchedule'];
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	'/reports/2021-06-30/documents/{reportDocumentId}': {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/**
		 * getReportDocument
		 * @description Returns the information required for retrieving a report document's contents.
		 *
		 *     **Usage Plan:**
		 *
		 *     | Rate (requests per second) | Burst |
		 *     | ---- | ---- |
		 *     | 0.0167 | 15 |
		 *
		 *     The `x-amzn-RateLimit-Limit` response header returns the usage plan rate limits that were applied to the requested operation, when available. The table above indicates the default rate and burst values for this operation. Selling partners whose business demands require higher throughput may see higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits in the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).
		 */
		get: operations['getReportDocument'];
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
		/** @description A list of error responses returned when a request is unsuccessful. */
		ErrorList: {
			/** @description Error response returned when the request is unsuccessful. */
			errors: components['schemas']['Error'][];
		};
		/** @description Error response returned when the request is unsuccessful. */
		Error: {
			/** @description An error code that identifies the type of error that occurred. */
			code: string;
			/** @description A message that describes the error condition. */
			message: string;
			/** @description Additional details that can help the caller understand or fix the issue. */
			details?: string;
		};
		/** @description Detailed information about the report. */
		Report: {
			/** @description A list of marketplace identifiers for the report. */
			marketplaceIds?: string[];
			/** @description The identifier for the report. This identifier is unique only in combination with a seller ID. */
			reportId: string;
			/** @description The report type. Refer to [Report Type Values](https://developer-docs.amazon.com/sp-api/docs/report-type-values) for more information. */
			reportType: string;
			/**
			 * Format: date-time
			 * @description The start of a date and time range used for selecting the data to report.
			 */
			dataStartTime?: string;
			/**
			 * Format: date-time
			 * @description The end of a date and time range used for selecting the data to report.
			 */
			dataEndTime?: string;
			/** @description The identifier of the report schedule that created this report (if any). This identifier is unique only in combination with a seller ID. */
			reportScheduleId?: string;
			/**
			 * Format: date-time
			 * @description The date and time when the report was created.
			 */
			createdTime: string;
			/**
			 * @description The processing status of the report.
			 * @enum {string}
			 */
			processingStatus:
				| 'CANCELLED'
				| 'DONE'
				| 'FATAL'
				| 'IN_PROGRESS'
				| 'IN_QUEUE';
			/**
			 * Format: date-time
			 * @description The date and time when the report processing started, in <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> date time format.
			 */
			processingStartTime?: string;
			/**
			 * Format: date-time
			 * @description The date and time when the report processing completed, in <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> date time format.
			 */
			processingEndTime?: string;
			/** @description The identifier for the report document. Pass this into the `getReportDocument` operation to get the information you will need to retrieve the report document's contents. */
			reportDocumentId?: string;
		};
		/** @description A list of reports. */
		ReportList: components['schemas']['Report'][];
		/** @description Information required to create the report schedule. */
		CreateReportScheduleSpecification: {
			/** @description The report type. Refer to [Report Type Values](https://developer-docs.amazon.com/sp-api/docs/report-type-values) for more information. */
			reportType: string;
			/** @description A list of marketplace identifiers for the report schedule. */
			marketplaceIds: string[];
			reportOptions?: components['schemas']['ReportOptions'];
			/**
			 * @description One of a set of predefined <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> periods that specifies how often a report should be created.
			 * @enum {string}
			 */
			period:
				| 'PT5M'
				| 'PT15M'
				| 'PT30M'
				| 'PT1H'
				| 'PT2H'
				| 'PT4H'
				| 'PT8H'
				| 'PT12H'
				| 'P1D'
				| 'P2D'
				| 'P3D'
				| 'PT84H'
				| 'P7D'
				| 'P14D'
				| 'P15D'
				| 'P18D'
				| 'P30D'
				| 'P1M';
			/**
			 * Format: date-time
			 * @description The date and time when the schedule will create its next report, in <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> date time format.
			 */
			nextReportCreationTime?: string;
		};
		/** @description Information required to create the report. */
		CreateReportSpecification: {
			reportOptions?: components['schemas']['ReportOptions'];
			/** @description The report type. Refer to [Report Type Values](https://developer-docs.amazon.com/sp-api/docs/report-type-values) for more information. */
			reportType: string;
			/**
			 * Format: date-time
			 * @description The start of a date and time range, in <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> date time format, used for selecting the data to report. The default is now. The value must be prior to or equal to the current date and time. Not all report types make use of this.
			 */
			dataStartTime?: string;
			/**
			 * Format: date-time
			 * @description The end of a date and time range, in <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> date time format, used for selecting the data to report. The default is now. The value must be prior to or equal to the current date and time. Not all report types make use of this.
			 */
			dataEndTime?: string;
			/** @description A list of marketplace identifiers. The report document's contents will contain data for all of the specified marketplaces, unless the report type indicates otherwise. */
			marketplaceIds: string[];
		};
		/** @description Additional information passed to reports. This varies by report type. */
		ReportOptions: {
			[key: string]: string;
		};
		/** @description Detailed information about a report schedule. */
		ReportSchedule: {
			/** @description The identifier for the report schedule. This identifier is unique only in combination with a seller ID. */
			reportScheduleId: string;
			/** @description The report type. Refer to [Report Type Values](https://developer-docs.amazon.com/sp-api/docs/report-type-values) for more information. */
			reportType: string;
			/** @description A list of marketplace identifiers. The report document's contents will contain data for all of the specified marketplaces, unless the report type indicates otherwise. */
			marketplaceIds?: string[];
			reportOptions?: components['schemas']['ReportOptions'];
			/** @description An <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> period value that indicates how often a report should be created. */
			period: string;
			/**
			 * Format: date-time
			 * @description The date and time when the schedule will create its next report, in <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> date time format.
			 */
			nextReportCreationTime?: string;
		};
		/** @description A list of report schedules. */
		ReportScheduleList: {
			/** @description Detailed information about a report schedule. */
			reportSchedules: components['schemas']['ReportSchedule'][];
		};
		/** @description The response schema. */
		CreateReportResponse: {
			/** @description The identifier for the report. This identifier is unique only in combination with a seller ID. */
			reportId: string;
		};
		/** @description The response for the `getReports` operation. */
		GetReportsResponse: {
			reports: components['schemas']['ReportList'];
			/** @description Returned when the number of results exceeds `pageSize`. To get the next page of results, call `getReports` with this token as the only parameter. */
			nextToken?: string;
		};
		/** @description Response schema. */
		CreateReportScheduleResponse: {
			/** @description The identifier for the report schedule. This identifier is unique only in combination with a seller ID. */
			reportScheduleId: string;
		};
		/** @description Information required for the report document. */
		ReportDocument: {
			/** @description The identifier for the report document. This identifier is unique only in combination with a seller ID. */
			reportDocumentId: string;
			/** @description A presigned URL for the report document. If `compressionAlgorithm` is not returned, you can download the report directly from this URL. This URL expires after 5 minutes. */
			url: string;
			/**
			 * @description If the report document contents have been compressed, the compression algorithm used is returned in this property and you must decompress the report when you download. Otherwise, you can download the report directly. Refer to [Step 2. Download the report](https://developer-docs.amazon.com/sp-api/docs/reports-api-v2021-06-30-retrieve-a-report#step-2-download-the-report) in the use case guide, where sample code is provided.
			 * @enum {string}
			 */
			compressionAlgorithm?: 'GZIP';
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
	getReports: {
		parameters: {
			query?: {
				/** @description A list of report types used to filter reports. Refer to [Report Type Values](https://developer-docs.amazon.com/sp-api/docs/report-type-values) for more information. When reportTypes is provided, the other filter parameters (processingStatuses, marketplaceIds, createdSince, createdUntil) and pageSize may also be provided. Either reportTypes or nextToken is required. */
				reportTypes?: string[];
				/** @description A list of processing statuses used to filter reports. */
				processingStatuses?: (
					| 'CANCELLED'
					| 'DONE'
					| 'FATAL'
					| 'IN_PROGRESS'
					| 'IN_QUEUE'
				)[];
				/** @description A list of marketplace identifiers used to filter reports. The reports returned will match at least one of the marketplaces that you specify. */
				marketplaceIds?: string[];
				/** @description The maximum number of reports to return in a single call. */
				pageSize?: number;
				/** @description The earliest report creation date and time for reports to include in the response, in <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> date time format. The default is 90 days ago. Reports are retained for a maximum of 90 days. */
				createdSince?: string;
				/** @description The latest report creation date and time for reports to include in the response, in <a href='https://developer-docs.amazon.com/sp-api/docs/iso-8601'>ISO 8601</a> date time format. The default is now. */
				createdUntil?: string;
				/** @description A string token returned in the response to your previous request. `nextToken` is returned when the number of results exceeds the specified `pageSize` value. To get the next page of results, call the `getReports` operation and include this token as the only parameter. Specifying `nextToken` with any other parameters will cause the request to fail. */
				nextToken?: string;
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
					'application/json': components['schemas']['GetReportsResponse'];
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
	createReport: {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/** @description Information required to create the report. */
		requestBody: {
			content: {
				'application/json': components['schemas']['CreateReportSpecification'];
			};
		};
		responses: {
			/** @description Success. */
			202: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateReportResponse'];
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
	getReport: {
		parameters: {
			query?: never;
			header?: never;
			path: {
				/** @description The identifier for the report. This identifier is unique only in combination with a seller ID. */
				reportId: string;
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
					'application/json': components['schemas']['Report'];
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
	cancelReport: {
		parameters: {
			query?: never;
			header?: never;
			path: {
				/** @description The identifier for the report. This identifier is unique only in combination with a seller ID. */
				reportId: string;
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
				content?: never;
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
	getReportSchedules: {
		parameters: {
			query: {
				/** @description A list of report types used to filter report schedules. Refer to [Report Type Values](https://developer-docs.amazon.com/sp-api/docs/report-type-values) for more information. */
				reportTypes: string[];
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
					'application/json': components['schemas']['ReportScheduleList'];
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
	createReportSchedule: {
		parameters: {
			query?: never;
			header?: never;
			path?: never;
			cookie?: never;
		};
		/** @description Information required to create the report schedule. */
		requestBody: {
			content: {
				'application/json': components['schemas']['CreateReportScheduleSpecification'];
			};
		};
		responses: {
			/** @description Success. */
			201: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					/** @description Your rate limit (requests per second) for this operation. */
					'x-amzn-RateLimit-Limit'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['CreateReportScheduleResponse'];
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
	getReportSchedule: {
		parameters: {
			query?: never;
			header?: never;
			path: {
				/** @description The identifier for the report schedule. This identifier is unique only in combination with a seller ID. */
				reportScheduleId: string;
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
					'application/json': components['schemas']['ReportSchedule'];
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
	cancelReportSchedule: {
		parameters: {
			query?: never;
			header?: never;
			path: {
				/** @description The identifier for the report schedule. This identifier is unique only in combination with a seller ID. */
				reportScheduleId: string;
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
				content?: never;
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
	getReportDocument: {
		parameters: {
			query?: never;
			header?: never;
			path: {
				/** @description The identifier for the report document. */
				reportDocumentId: string;
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
					'application/json': components['schemas']['ReportDocument'];
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
			/** @description The request's Authorization header is not formatted correctly or does not contain a valid token. */
			401: {
				headers: {
					/** @description Unique request reference identifier. */
					'x-amzn-RequestId'?: string;
					[name: string]: unknown;
				};
				content: {
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description Indicates access to the resource is forbidden. Possible reasons include Access Denied, Unauthorized, Expired Token, or Invalid Signature. */
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
					'application/json': components['schemas']['ErrorList'];
				};
			};
			/** @description The request's Content-Type header is invalid. */
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
