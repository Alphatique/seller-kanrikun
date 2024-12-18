export const filterMonthlyReport = /*sql*/ `
SELECT
    strftime(date_trunc('month', "posted-date"), '%Y-%B') AS date,
    SUM(CASE WHEN "transaction-type" = 'Order' AND "price-type" = 'Principal' THEN "price-amount" ELSE 0 END) AS principal,
    SUM(CASE WHEN "transaction-type" = 'Order' AND "price-type" = 'Tax' THEN "price-amount" ELSE 0 END) AS principalTax,
    SUM(CASE WHEN "transaction-type" = 'Order' AND "price-type" = 'Shipping' THEN "price-amount" ELSE 0 END) AS shipping,
    SUM(CASE WHEN "transaction-type" = 'Order' AND "price-type" = 'ShippingTax' THEN "price-amount" ELSE 0 END) AS shippingTax,
    SUM(CASE WHEN "transaction-type" = 'Refund' THEN "price-amount" ELSE 0 END) AS refund,
    SUM(CASE WHEN "transaction-type" = 'Refund' THEN "item-related-fee-amount" ELSE 0 END) AS refundFee,
    SUM(CASE WHEN "transaction-type" = 'Refund' THEN "promotion-amount" ELSE 0 END) AS refundPromotion,
    SUM(CASE WHEN "transaction-type" = 'Refund' AND "promotion-type" = 'TaxDiscount' THEN "promotion-amount" ELSE 0 END) AS refundTaxDiscount,

    SUM(CASE WHEN "transaction-type" = 'Shipping' THEN "price-amount" ELSE 0 END) AS promotion,
    SUM(CASE WHEN "transaction-type" = 'Order' AND "item-related-fee-type" = 'Commission' THEN "item-related-fee-amount" ELSE 0 END) AS commissionFee,
    SUM(CASE WHEN "transaction-type" = 'Order' AND "item-related-fee-type" = 'FBAPerUnitFulfillmentFee' THEN "item-related-fee-amount" ELSE 0 END) AS fbaShippingFee,
    SUM(CASE WHEN "transaction-type" = 'Storage Fee' THEN "item-related-fee-amount" ELSE 0 END) AS inventoryStorageFee,
    SUM(CASE WHEN "transaction-type" = 'StorageRenewalBilling' THEN "other-amount" ELSE 0 END) AS inventoryUpdateFee,
    SUM(CASE WHEN "transaction-type" = 'Order' AND "other-fee-reason-description" = 'ShippingChargeback' THEN "other-amount" ELSE 0 END) AS shippingReturnFee,
    SUM(CASE WHEN "transaction-type" = 'Subscription Fee' THEN "other-amount" ELSE 0 END) AS subscriptionFee,
FROM report
GROUP BY date_trunc('month', "posted-date");
`;
