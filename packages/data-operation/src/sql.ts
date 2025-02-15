export const calcPlbsSql = /*sql*/ `
SELECT
    coalesce(p.date, c.date) AS date,
    coalesce(c.costPrice, 0) AS costPrice,
    p.principal,
    p.principalTax,
    p.shipping,
    p.shippingTax,
    p.refund,
    p.promotion,
    p.commissionFee,
    p.fbaShippingFee,
    p.inventoryStorageFee,
    p.inventoryUpdateFee,
    p.shippingReturnFee,
    p.accountSubscriptionFee,
    p.accountsReceivable
FROM (
SELECT
    -- date_truncはduckdbの関数
    date_trunc('month', postedDate) AS date,
    SUM(priceAmount) FILTER (transactionType = 'Order' AND priceType = 'Principal') AS principal,
    SUM(priceAmount) FILTER (transactionType = 'Order' AND priceType = 'Tax') AS principalTax,
    SUM(priceAmount) FILTER (transactionType = 'Order' AND priceType = 'Shipping') AS shipping,
    SUM(priceAmount) FILTER (transactionType = 'Order' AND priceType = 'ShippingTax') AS shippingTax,
    -- 価格合計
    COALESCE(SUM(priceAmount) FILTER (transactionType = 'Refund'), 0)
    -- 手数料合計
    + COALESCE(SUM(itemRelatedFeeAmount) FILTER (transactionType = 'Refund'))
    -- TaxDiscountプロモーションを除外したプロモーション合計
    + COALESCE(SUM(promotionAmount) FILTER (transactionType = 'Refund' AND promotionType != 'TaxDiscount'))
     AS refund,
    SUM(priceAmount) FILTER (transactionType = 'Shipping') AS promotion,
    SUM(itemRelatedFeeAmount) FILTER (transactionType = 'Order' AND itemRelatedFeeType = 'Commission') AS commissionFee,
    SUM(itemRelatedFeeAmount) FILTER (transactionType = 'Order' AND itemRelatedFeeType = 'FBAPerUnitFulfillmentFee') AS fbaShippingFee,
    SUM(itemRelatedFeeAmount) FILTER (transactionType = 'Storage Fee') AS inventoryStorageFee,
    SUM(otherAmount) FILTER (transactionType = 'StorageRenewalBilling') AS inventoryUpdateFee,
    SUM(otherAmount) FILTER (transactionType = 'Order' AND otherFeeReasonDescription = 'ShippingChargeback') AS shippingReturnFee,
    SUM(otherAmount) FILTER (transactionType = 'Subscription Fee') AS accountSubscriptionFee,
    COALESCE(SUM(shipmentFeeAmount), 0)
    + COALESCE(SUM(orderFeeAmount), 0)
    + COALESCE(SUM(priceAmount), 0)
    + COALESCE(SUM(itemRelatedFeeAmount), 0)
    + COALESCE(SUM(miscFeeAmount), 0)
    + COALESCE(SUM(otherFeeAmount), 0)
    + COALESCE(SUM(promotionAmount), 0)
    + COALESCE(SUM(otherAmount), 0)
    AS accountsReceivable
FROM settlementReport
-- posted-dateがNULLの行はスキップ
WHERE postedDate IS NOT NULL
    AND postedDate >= '2024-12-01'
GROUP BY date_trunc('month', postedDate)
-- 月ごとにグループ化
) AS p
FULL OUTER JOIN (
    SELECT
        date_trunc('month', r.postedDate) AS date,
        SUM(cp.price) AS costPrice
    FROM settlementReport AS r
    -- TODO: inventoryを取得した時期のsku/asinを使うように変更
    JOIN inventorySummaries AS inv ON r.sku = inv.sellerSku
    JOIN costPrice AS cp ON inv.asin = cp.asin
        AND r.postedDate >= cp.startDate
        AND r.postedDate <= cp.endDate
    WHERE postedDate IS NOT NULL
      AND postedDate >= '2024-12-01'
    GROUP BY date_trunc('month', r.postedDate)
) AS c
ON p.date = c.date
`;

export const calcSessionCvrSql = /*sql*/ `
SELECT
    coalesce(r.asin, i.asin) AS asin,
    i.asin AS invAsin,
    r.asin AS rAsin,
    i.name,
    r.date,
    r.sales,
    r.units,
    r.averagePrice,
    r.pageViews,
    r.sessionCvr,
    r.pageViewCvr
FROM (
SELECT
    parentAsin AS asin,
    dataStartTime AS date,
    orderedProductSalesAmount AS sales,
    unitsOrdered AS units,
    sales / units AS averagePrice,
    pageViews,
    sessions / units AS sessionCvr,
    pageViews / units AS pageViewCvr
FROM salesTrafficReport) as r
LEFT OUTER JOIN (
    SELECT
        asin,
        productName AS name
    FROM inventorySummaries
) as i
ON r.asin = i.asin
`;
