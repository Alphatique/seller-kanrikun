import { betterFetch } from '@better-fetch/fetch';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import type { ClientType } from '@seller-kanrikun/db';
import { account } from '@seller-kanrikun/db/schema';

const tokenEndpoint = 'https://api.amazon.co.jp/auth/o2/token';

export async function getSPAPIAccessToken(userId: string, db: ClientType) {
	const account = await db.query.account.findFirst({
		where: (t, { and, eq }) =>
			and(eq(t.userId, userId), eq(t.providerId, 'seller-central')),
	});
	if (!account) throw new Error('account not found');

	const { accessToken, accessTokenExpiresAt, refreshToken } = account;
	if (!(accessToken && accessTokenExpiresAt && refreshToken))
		throw new Error('accessToken not found');

	if (new Date().getTime() > accessTokenExpiresAt.getTime()) {
		return await refreshAccessToken(
			{
				userId,
				refreshToken,
			},
			db,
		);
	}

	return accessToken;
}

async function refreshAccessToken(
	{
		userId,
		refreshToken,
	}: {
		userId: string;
		refreshToken: string;
	},
	db: ClientType,
) {
	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		client_id: process.env.SP_API_CLIENT_ID!,
		client_secret: process.env.SP_API_CLIENT_SECRET!,
	});

	const tokens = await betterFetch(tokenEndpoint, {
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
		throw: true,
	});

	const now = new Date();
	const expiresAt = new Date(now.getTime() + tokens.expires_in * 1000);

	await db
		.update(account)
		.set({
			accessToken: tokens.access_token,
			accessTokenExpiresAt: expiresAt,
			refreshToken: tokens.refresh_token,
			updatedAt: now,
		})
		.where(
			and(
				eq(account.userId, userId),
				eq(account.providerId, 'seller-central'),
			),
		);

	return tokens.access_token;
}
