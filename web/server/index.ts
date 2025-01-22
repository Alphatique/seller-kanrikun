import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { auth } from '@seller-kanrikun/auth/server';
import {
	getReadOnlySignedUrl,
	getWriteOnlySignedUrl,
} from '@seller-kanrikun/data-operation/r2';

import { FILE_NAMES, R2_BUCKET_NAME } from '~/lib/constants';

import { app as first } from './first';
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
	.route('/first', first)
	.route('/link-account', linkAccount)
	.put('/cost-price', authMiddleware, async c => {
		console.log('cost-price put');
		const result = await getWriteOnlySignedUrl(
			R2_BUCKET_NAME,
			c.var.user.id,
			FILE_NAMES.COST_PRICE,
		);
		if (result.isErr())
			return new Response('Internal Server Error', {
				status: 500,
				statusText: `Error: ${result.error?.message ?? 'Unknown'}`,
			});

		const url = result.value;
		return new Response(null, {
			status: 302,
			headers: {
				Location: url,
			},
		});
	})
	.get(
		'/:slug{reports/settlement|reports/sales-traffic|cost-price|inventory|catalog}',
		authMiddleware,
		async c => {
			const slug = c.req.param('slug');

			const fileName = {
				'reports/settlement': FILE_NAMES.SETTLEMENT_REPORT,
				'reports/sales-traffic': FILE_NAMES.SALES_TRAFFIC,
				'cost-price': FILE_NAMES.COST_PRICE,
				inventory: FILE_NAMES.INVENTORY_SUMMARIES,
				catalog: FILE_NAMES.CATALOG_ITEMS,
			}[slug];
			if (!fileName) throw new Error();

			const url = await getReadOnlySignedUrl(
				R2_BUCKET_NAME,
				c.var.user.id,
				fileName,
			);

			return new Response(null, {
				status: 302,
				headers: {
					Location: url,
				},
			});
		},
	);

export type RouteType = typeof route;
