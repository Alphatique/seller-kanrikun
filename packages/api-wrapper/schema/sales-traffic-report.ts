import z from 'zod';

const salesByAsin = z.object({
	unitsOrdered: z.number(),
	orderedProductSales: z.object({
		amount: z.number(),
		currencyCode: z.string(),
	}),
});
const trafficByAsin = z.object({
	browserSessions: z.number(),
	mobileAppSessions: z.number(),
	sessions: z.number(),
	browserSessionPercentage: z.number(),
	mobileAppSessionPercentage: z.number(),
	sessionPercentage: z.number(),
	browserPageViews: z.number(),
	mobileAppPageViews: z.number(),
	pageViews: z.number(),
});

const salesAndTrafficByAsin = z.object({
	parentAsin: z.string(),
	childAsin: z.string(),
	salesByAsin: salesByAsin,
	trafficByAsin: trafficByAsin,
});

export const salesTrafficReportDocument = z.object({
	reportSpecification: z.object({
		dataStartTime: z.coerce.date(),
		dataEndTime: z.coerce.date(),
	}),
	salesAndTrafficByAsin: z.array(salesAndTrafficByAsin),
});
// ここまで読み取り用

// これを保存する
export const salesAndTrafficReportDocumentRow = z.object({
	parentAsin: z.string(),
	childAsin: z.string(),
	// 以下階層取っ払ってもってきたプロパティ
	// salesByAsin
	unitsOrdered: z.number(),
	orderedProductSalesAmount: z.number(),
	orderedProductSalesCurrencyCode: z.string(),
	// trafficByAsin
	browserSessions: z.number(),
	mobileAppSessions: z.number(),
	sessions: z.number(),
	browserSessionPercentage: z.number(),
	mobileAppSessionPercentage: z.number(),
	sessionPercentage: z.number(),
	browserPageViews: z.number(),
	mobileAppPageViews: z.number(),
	pageViews: z.number(),
	// データの時間を持っておく
	dataStartTime: z.coerce.date(),
	dataEndTime: z.coerce.date(),
	// これは完全自作プロパティ
	// 保存した時間
	sellerKanrikunSaveTime: z.coerce.date(),
});
export const salesAndTrafficReportDocument = z.array(
	salesAndTrafficReportDocumentRow,
);

export type SalesAndTrafficReportDocumentRow = z.infer<
	typeof salesAndTrafficReportDocumentRow
>;

export type SalesAndTrafficReportDocument = z.infer<
	typeof salesAndTrafficReportDocument
>;
