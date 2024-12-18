export function getFilterReportSql(): string {
	return /*sql*/ `
SELECT
    -- date_truncはduckdbの関数
    date_trunc('month', "posted-date") AS date,　
    -- 以下は各種フィルターをして各値を合計していってる
    SUM("price-amount") FILTER (WHERE "transaction-type" = 'Order' AND "price-type" = 'Principal') AS principal,
    SUM("price-amount") FILTER (WHERE "transaction-type" = 'Order' AND "price-type" = 'Tax') AS principalTax,
    SUM("price-amount") FILTER (WHERE "transaction-type" = 'Order' AND "price-type" = 'Shipping') AS shipping,
    SUM("price-amount") FILTER (WHERE "transaction-type" = 'Order' AND "price-type" = 'ShippingTax') AS shippingTax,
    -- 価格合計
    COALESCE(SUM("price-amount") FILTER (WHERE "transaction-type" = 'Refund'), 0)
    -- 手数料合計
    + COALESCE(SUM("item-related-fee-amount") FILTER (WHERE "transaction-type" = 'Refund'))
    -- TaxDiscountプロモーションを除外したプロモーション合計
    + COALESCE(SUM("promotion-amount") FILTER (WHERE "transaction-type" = 'Refund' AND "promotion-type" != 'TaxDiscount'))
     AS refund,
    SUM("price-amount") FILTER (WHERE "transaction-type" = 'Shipping') AS promotion,
    SUM("item-related-fee-amount") FILTER (WHERE "transaction-type" = 'Order' AND "item-related-fee-type" = 'Commission') AS commissionFee,
    SUM("item-related-fee-amount") FILTER (WHERE "transaction-type" = 'Order' AND "item-related-fee-type" = 'FBAPerUnitFulfillmentFee') AS fbaShippingFee,
    SUM("item-related-fee-amount") FILTER (WHERE "transaction-type" = 'Storage Fee') AS inventoryStorageFee,
    SUM("other-amount") FILTER (WHERE "transaction-type" = 'StorageRenewalBilling') AS inventoryUpdateFee,
    SUM("other-amount") FILTER (WHERE "transaction-type" = 'Order' AND "other-fee-reason-description" = 'ShippingChargeback') AS shippingReturnFee,
    SUM("other-amount") FILTER (WHERE "transaction-type" = 'Subscription Fee') AS accountSubscriptionFee,
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
FROM report
-- posted-dateがNULLの行はスキップ
WHERE "posted-date" IS NOT NULL
-- 月ごとにグループ化
GROUP BY date_trunc('month', "posted-date");
`;
}
