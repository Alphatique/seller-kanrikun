import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { auth } from '@seller-kanrikun/auth/server';
import {
	tsvGzipToTsvObj,
	tsvObjToTsvGzip,
} from '@seller-kanrikun/data-operation/tsv-gzip';
import type { CostPriceTsv } from '@seller-kanrikun/data-operation/types/cost';

import { FILE_NAMES } from '~/lib/constants';
import {
	doesFileExist,
	getApi,
	getReadOnlySignedUrl,
	getWriteOnlySignedUrl,
	putApi,
} from '~/lib/r2';

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

			return await getApi(c.req.raw, fileName);
		},
	)
	.route('/cost-price', costPrice)
	.post('/first', authMiddleware, async c => {
		const session = c.var.session;

		const hasFile = await doesFileExist(
			session.user.id,
			FILE_NAMES.COST_PRICE,
		);
		if (!hasFile) {
			const url = await getWriteOnlySignedUrl(
				session.user.id,
				FILE_NAMES.COST_PRICE,
			);
			const emptyCostPrice: CostPriceTsv[] = [];
			// papaparseの無駄遣い
			const tsvArray = tsvObjToTsvGzip(emptyCostPrice);

			const response = await fetch(url, {
				method: 'PUT',
				body: tsvArray,
			});

			if (!response.ok)
				return c.json(
					{
						error: 'failed to upload',
					},
					500,
				);

			return c.json({});
		} else {
			return c.json(
				{
					error: 'file already exists',
				},
				403,
			);
		}
	});

export type RouteType = typeof route;
