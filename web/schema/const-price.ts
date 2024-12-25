import { CostPriceSchema } from '@seller-kanrikun/data-operation/types/cost';
import { z } from 'zod';

export const uploadCostPriceSchema = z.object({
	start: z.coerce.date(),
	end: z.coerce.date(),
	values: z.array(CostPriceSchema),
});
