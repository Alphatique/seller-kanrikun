import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { auth } from '@seller-kanrikun/auth/server';
import {
	tsvGzipToTsvObj,
	tsvObjToTsvGzip,
} from '@seller-kanrikun/data-operation/tsv-gzip';
import type { CostPriceTsv } from '@seller-kanrikun/data-operation/types/cost';

import { FILE_NAMES } from '~/lib/constants';
import { getReadOnlySignedUrl, getWriteOnlySignedUrl } from '~/lib/r2';

import { app as costPrice } from './cost-price';
import { app as linkAccount } from './link-account';
import { authMiddleware } from './middleware';

export const app = new Hono().basePath('/api');

const route = app
	.use(logger(text => console.log(`[API] ${text}`)))
	.get('/status', async c => {
		return c.json({ status: 'ok' });
	})
	.on(['POST', 'GET'], '/auth/*', c => {
		return auth.handler(c.req.raw);
	})
	.route('/link-account', linkAccount)
	.get(
		'/:slug{reports/settlement|reports/sales-traffic|cost-price|inventory|catalog}',
		authMiddleware,
		async c => {
			const slug = c.req.param('slug');
			console.log({ slug });

			const fileName = {
				'reports/settlement': FILE_NAMES.SETTLEMENT_REPORT,
				'reports/sales-traffic': FILE_NAMES.SALES_TRAFFIC,
				'cost-price': FILE_NAMES.COST_PRICE,
				inventory: FILE_NAMES.INVENTORY_SUMMARIES,
				catalog: FILE_NAMES.CATALOG_ITEMS,
			}[slug];
			if (!fileName) throw new Error();

			const url = await getReadOnlySignedUrl(c.var.user.id, fileName);

			return new Response(null, {
				status: 302,
				headers: {
					location: url,
				},
			});
		},
	)
	.post('/cost-price', authMiddleware, async c => {
		const url = await getWriteOnlySignedUrl(
			c.var.user.id,
			FILE_NAMES.COST_PRICE,
		);
		return new Response('ok');
	});

export type RouteType = typeof route;
