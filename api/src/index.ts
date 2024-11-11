import type { createClient } from '@libsql/client';
import type { Account } from '@seller-kanrikun/db';
import { account, createDbClient } from '@seller-kanrikun/db';
import { eq } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/libsql';
import { Hono } from 'hono';
import type { AuthTokenResponse } from '../types/amazon';

const app = new Hono<{ Bindings: CloudflareBindings }>();
let dbClient: {
	client: ReturnType<typeof createClient>;
	db: ReturnType<typeof drizzle>;
} | null = null;

function initDb(env: CloudflareBindings) {
	if (!dbClient) {
		dbClient = createDbClient(env.TURSO_CONNECTION_URL!, env.TURSO_AUTH_TOKEN!);
	}
	return dbClient.db;
}

app.get('/report', async c => {});

app.get('/account/refresh_tokens', async c => {
	const db = initDb(c.env);

	const accounts = await db.select().from(account).all();

	for (const eachAccount of accounts) {
		if (
			eachAccount.refreshToken !== null &&
			eachAccount.expiresAt !== null &&
			eachAccount.expiresAt.getTime() < Date.now()
		) {
			switch (eachAccount.providerId) {
				case 'amazon':
					await updateAccessToken(
						c.env,
						eachAccount,
						c.env.AMAZON_CLIENT_ID,
						c.env.AMAZON_CLIENT_SECRET,
					);
					break;
				case 'seller-central':
					await updateAccessToken(
						c.env,
						eachAccount,
						c.env.SP_API_CLIENT_ID,
						c.env.SP_API_CLIENT_SECRET,
					);
					break;
			}
		}
	}
});

async function updateAccessToken(
	env: CloudflareBindings,
	accountData: Account,
	clientId: string,
	clientSecret: string,
) {
	if (
		accountData.expiresAt &&
		accountData.expiresAt.getTime() < Date.now() &&
		accountData.refreshToken
	) {
		const db = initDb(env);
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

		db.update(account)
			.set({ accessToken: accessTokenJson.access_token, expiresAt: expiresAt })
			.where(
				eq(account.id, accountData.id) &&
					eq(account.providerId, accountData.providerId),
			);
	}
}

export default app;
