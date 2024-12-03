import type { ClientType } from '@seller-kanrikun/db';
import type { Account } from '@seller-kanrikun/db/schema';
import { account } from '@seller-kanrikun/db/schema';
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import type { AuthTokenResponse } from '../types';

export async function getAccountsByProviderId(
	db: ClientType,
	providerId: string,
) {
	return await db
		.select()
		.from(account)
		.where(eq(account.providerId, providerId))
		.all();
}

export async function updateAccessToken(
	db: ClientType,
	accountData: Account,
	clientId: string,
	clientSecret: string,
) {
	if (
		accountData.accessTokenExpiresAt &&
		accountData.accessTokenExpiresAt.getTime() < Date.now() &&
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

		const accessTokenJson = (await getAccessToken.json()) as AuthTokenResponse;

		const expiresAt = new Date(Date.now() + accessTokenJson.expires_in * 1000);

		await db
			.update(account)
			.set({
				accessToken: accessTokenJson.access_token,
				accessTokenExpiresAt: expiresAt,
			})
			.where(eq(account.id, accountData.id))
			.run();
	}
}

export async function refreshAccountsTokens(
	db: ClientType,
	amazonClientId: string,
	amazonClientSecret: string,
	spApiClientId: string,
	spApiClientSecret: string,
) {
	const accounts = await db
		.select()
		.from(account)
		.where(
			and(
				isNotNull(account.refreshToken),
				isNotNull(account.accessTokenExpiresAt),
				lt(account.accessTokenExpiresAt, new Date()),
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
					amazonClientId,
					amazonClientSecret,
				);
				break;
			case 'seller-central':
				await updateAccessToken(
					db,
					eachAccount,
					spApiClientId,
					spApiClientSecret,
				);
				break;
		}
	}

	return new Response('ok');
}
