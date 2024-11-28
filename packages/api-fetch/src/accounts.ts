import type { AuthTokenResponse } from '../types';
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
