import type { Account } from '@seller-kanrikun/db';
import { account } from '@seller-kanrikun/db';
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/libsql';
import { Hono } from 'hono';
import type { AuthTokenResponse, MyHonoInitializer } from '~/types';

const app = new Hono<MyHonoInitializer>();

export async function updateAccessToken(
	db: ReturnType<typeof drizzle>,
	accountData: Account,
	clientId: string,
	clientSecret: string,
) {
	if (
		accountData.expiresAt &&
		accountData.expiresAt.getTime() < Date.now() &&
		accountData.refreshToken
	) {
		const getAccessToken = await fetch(
			'https://api.amazon.co.jp/auth/o2/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: accountData.refreshToken!, // TODO: check if refreshToken is null
					client_id: clientId,
					client_secret: clientSecret,
				}),
			},
		);

		const accessTokenJson: AuthTokenResponse = await getAccessToken.json();

		const expiresAt = new Date(Date.now() + accessTokenJson.expires_in * 1000);

		await db
			.update(account)
			.set({ accessToken: accessTokenJson.access_token, expiresAt: expiresAt })
			.where(eq(account.id, accountData.id))
			.run();
	}
}

app.get('/account/refresh_tokens', async c => {
	const db = c.get('DB');
	const accounts = await db
		.select()
		.from(account)
		.where(
			and(
				isNotNull(account.refreshToken),
				isNotNull(account.expiresAt),
				lt(account.expiresAt, new Date()),
			),
		)
		.all();

	for (const eachAccount of accounts) {
		console.log(eachAccount);
		switch (eachAccount.providerId) {
			case 'amazon':
				await updateAccessToken(
					db,
					eachAccount,
					c.env.AMAZON_CLIENT_ID,
					c.env.AMAZON_CLIENT_SECRET,
				);
				break;
			case 'seller-central':
				await updateAccessToken(
					db,
					eachAccount,
					c.env.SP_API_CLIENT_ID,
					c.env.SP_API_CLIENT_SECRET,
				);
				break;
		}
	}

	return new Response('ok');
});

export default app;
