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
    date_trunc('month', "posted-date") AS date,　
    SUM("price-amount") FILTER ("transaction-type" = 'Order' AND "price-type" = 'Principal') AS principal,
    SUM("price-amount") FILTER ("transaction-type" = 'Order' AND "price-type" = 'Tax') AS principalTax,
    SUM("price-amount") FILTER ("transaction-type" = 'Order' AND "price-type" = 'Shipping') AS shipping,
    SUM("price-amount") FILTER ("transaction-type" = 'Order' AND "price-type" = 'ShippingTax') AS shippingTax,
    -- 価格合計
    COALESCE(SUM("price-amount") FILTER ("transaction-type" = 'Refund'), 0)
    -- 手数料合計
    + COALESCE(SUM("item-related-fee-amount") FILTER ("transaction-type" = 'Refund'))
    -- TaxDiscountプロモーションを除外したプロモーション合計
    + COALESCE(SUM("promotion-amount") FILTER ("transaction-type" = 'Refund' AND "promotion-type" != 'TaxDiscount'))
     AS refund,
    SUM("price-amount") FILTER ("transaction-type" = 'Shipping') AS promotion,
    SUM("item-related-fee-amount") FILTER ("transaction-type" = 'Order' AND "item-related-fee-type" = 'Commission') AS commissionFee,
    SUM("item-related-fee-amount") FILTER ("transaction-type" = 'Order' AND "item-related-fee-type" = 'FBAPerUnitFulfillmentFee') AS fbaShippingFee,
    SUM("item-related-fee-amount") FILTER ("transaction-type" = 'Storage Fee') AS inventoryStorageFee,
    SUM("other-amount") FILTER ("transaction-type" = 'StorageRenewalBilling') AS inventoryUpdateFee,
    SUM("other-amount") FILTER ("transaction-type" = 'Order' AND "other-fee-reason-description" = 'ShippingChargeback') AS shippingReturnFee,
    SUM("other-amount") FILTER ("transaction-type" = 'Subscription Fee') AS accountSubscriptionFee,
    COALESCE(SUM("shipment-fee-amount"), 0)
    + COALESCE(SUM("order-fee-amount"), 0)
    + COALESCE(SUM("price-amount"), 0)
    + COALESCE(SUM("item-related-fee-amount"), 0)
    + COALESCE(SUM("misc-fee-amount"), 0)
    + COALESCE(SUM("other-fee-amount"), 0)
    + COALESCE(SUM("promotion-amount"), 0)
    + COALESCE(SUM("direct-payment-amount"), 0)
    + COALESCE(SUM("other-amount"), 0)
    AS accountsReceivable
FROM settlement_report
-- posted-dateがNULLの行はスキップ
WHERE "posted-date" IS NOT NULL
-- 月ごとにグループ化
GROUP BY date_trunc('month', "posted-date")
) AS p
FULL OUTER JOIN (
    SELECT
        date_trunc('month', r."posted-date") AS date,
        SUM(cp."price") AS costPrice
    FROM settlement_report AS r
    -- TODO: inventoryを取得した時期のsku/asinを使うように変更
    JOIN inventory_summaries AS inv ON r.sku = inv.sellerSku
    JOIN cost_price AS cp ON inv.asin = cp.asin
        AND r."posted-date" >= cp.startDate
        AND r."posted-date" <= cp.endDate
    WHERE "posted-date" IS NOT NULL
    GROUP BY date_trunc('month', r."posted-date")
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
    asin,
    startDate AS date,
    orderedProductSalesAmount AS sales,
    unitsOrdered AS units,
    sales / units AS averagePrice,
    pageViews,
    sessions / units AS sessionCvr,
    pageViews / units AS pageViewCvr
FROM sales_traffic_report) as r
LEFT OUTER JOIN (
    SELECT
        asin,
        productName AS name
    FROM inventory_summaries
) as i
ON r.asin = i.asin
`;
