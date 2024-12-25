import { betterFetch } from '@better-fetch/fetch';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import {
	account,
	accountLinkingVerification,
} from '@seller-kanrikun/db/schema';

import { authMiddleware, dbMiddleware } from './middleware';

const redirectURI = `${process.env.BETTER_AUTH_URL}/api/link-account/callback`;
const tokenEndpoint = 'https://api.amazon.co.jp/auth/o2/token';

export const app = new Hono()
	.use(authMiddleware)
	.get('/', dbMiddleware, async c => {
		const verification = (
			await c.var.db
				.insert(accountLinkingVerification)
				.values({
					id: nanoid(),
					userId: c.var.user.id,
				})
				.returning()
		)[0];

		const url = new URL(
			'https://sellercentral.amazon.co.jp/apps/authorize/consent',
		);
		url.searchParams.set('version', 'beta');
		url.searchParams.set(
			'application_id',
			process.env.SP_API_APPLICATION_ID!,
		);
		url.searchParams.set('state', verification.id);
		url.searchParams.set('redirect_uri', redirectURI);

		return c.redirect(url);
	})
	.get(
		'/callback',
		dbMiddleware,
		zValidator(
			'query',
			z.object({
				state: z.string(),
				selling_partner_id: z.string(),
				spapi_oauth_code: z.string(),
			}),
		),
		async c => {
			const { state, selling_partner_id, spapi_oauth_code } =
				c.req.valid('query');

			const verification =
				await c.var.db.query.accountLinkingVerification.findFirst({
					where: (t, { eq }) => eq(t.id, state),
				});
			if (!verification)
				return c.json({
					error: 'invalid verification token',
				});

			await c.var.db
				.delete(accountLinkingVerification)
				.where(eq(accountLinkingVerification.id, state));

			const body = new URLSearchParams({
				grant_type: 'authorization_code',
				code: spapi_oauth_code,
				redirect_uri: redirectURI,
				client_id: process.env.SP_API_CLIENT_ID!,
				client_secret: process.env.SP_API_CLIENT_SECRET!,
			});

			const { data: tokens, error: tokensError } = await betterFetch(
				tokenEndpoint,
				{
					method: 'POST',
					headers: {
						'content-type': 'application/x-www-form-urlencoded',
						accept: 'application/json',
					},
					body,
					output: z.object({
						access_token: z.string(),
						refresh_token: z.string(),
						expires_in: z.number(),
					}),
				},
			);
			if (tokensError) {
				console.error(tokensError);
				return c.json({
					error: 'failed to fetch token',
				});
			}

			const now = new Date();

			await c.var.db
				.delete(account)
				.where(
					and(
						eq(account.userId, c.var.user.id),
						eq(account.providerId, 'seller-central'),
					),
				);

			await c.var.db.insert(account).values({
				id: nanoid(),
				accountId: selling_partner_id,
				providerId: 'seller-central',
				userId: c.var.user.id,
				accessToken: tokens.access_token,
				accessTokenExpiresAt: new Date(
					now.getTime() + tokens.expires_in,
				),
				refreshToken: tokens.refresh_token,
				createdAt: now,
				updatedAt: now,
			});

			return c.redirect('/dashboard');
		},
	);
