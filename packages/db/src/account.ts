import { eq } from 'drizzle-orm';
import type { ClientType } from './index';
import { type Account, account } from './schema';

// プロバイダーIDからアカウントを取得
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

// 一旦dbに置いておくけど全然動かしていい
export async function refreshAccessToken(
	db: ClientType,
	accountData: Account,
	clientId: string,
	clientSecret: string,
): Promise<Account> {
	// リフレッシュトークンがない場合は更新できない
	if (!accountData.refreshToken) {
		console.error('refreshToken is null');
		return accountData;
	}

	// 期限が有効ならそのまま返す
	if (
		accountData.accessTokenExpiresAt &&
		Date.now() < accountData.accessTokenExpiresAt.getTime()
	)
		return accountData;

	const url = 'https://api.amazon.co.jp/auth/o2/token';
	// リフレッシュトークンから新規アクセストークンを取得
	const { accessToken, expiresAt } = await getAccessTokenFromRefreshToken(
		url,
		accountData.refreshToken!,
		clientId,
		clientSecret,
	);

	// dbデータを更新。awaitいるかもしらん
	db.update(account)
		.set({
			accessToken,
			accessTokenExpiresAt: expiresAt,
		})
		.where(eq(account.id, account.id))
		.execute();

	// 値渡しっぽくなると呼び出し元のトークンが変更されなくなったりするので注意
	// 更新したデータを返す
	accountData.accessToken = accessToken;
	accountData.accessTokenExpiresAt = expiresAt;
	return accountData;
}

export async function refreshAccountsToken(
	db: ClientType,
	accounts: Account[],
	amazonClientId: string,
	amazonClientSecret: string,
	spApiClientId: string,
	spApiClientSecret: string,
) {
	// アカウントごとにトークンを更新
	for (let eachAccount of accounts) {
		// アカウントのプロバイダーによって処理を分岐
		switch (eachAccount.providerId) {
			case 'amazon':
				// 値渡しっぽくなるとトークンが変更されなくなったりするので注意
				eachAccount = await refreshAccessToken(
					db,
					eachAccount,
					amazonClientId,
					amazonClientSecret,
				);
				break;
			case 'seller-central':
				eachAccount = await refreshAccessToken(
					db,
					eachAccount,
					spApiClientId,
					spApiClientSecret,
				);
				break;
		}
	}
	return accounts;
}

export async function getAccessTokenFromRefreshToken(
	url: string,
	refreshToken: string,
	clientId: string,
	clientSecret: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
	const getAccessToken = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken, // TODO: check if refreshToken is null
			client_id: clientId,
			client_secret: clientSecret,
		}),
	});

	const accessTokenJson: AuthTokenResponse =
		(await getAccessToken.json()) as AuthTokenResponse;

	const expiresAt = new Date(Date.now() + accessTokenJson.expires_in * 1000);

	return {
		accessToken: accessTokenJson.access_token,
		expiresAt,
	};
}
export type AuthTokenResponse = {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
};
