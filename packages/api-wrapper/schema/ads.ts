import { z } from 'zod';

export const invoiceSummary = z.object({
	month: z.string(),
	total: z.number(),
});

export const invoiceSummaries = z.object({
	sellerKanrikunSaveTime: z.coerce.date(),
	invoiceSummaries: z.array(invoiceSummary),
});

export type InvoiceSummary = z.infer<typeof invoiceSummary>;
export type InvoiceSummaries = z.infer<typeof invoiceSummaries>;
