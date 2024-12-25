import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';

import { createClient } from '@seller-kanrikun/db';

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(
		createClient({
			url: process.env.TURSO_CONNECTION_URL!,
			authToken: process.env.TURSO_AUTH_TOKEN!,
		}),
		{
			provider: 'sqlite',
		},
	),
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'amazon',
					clientId: process.env.AMAZON_CLIENT_ID!,
					clientSecret: process.env.AMAZON_CLIENT_SECRET!,
					authorizationUrl: 'https://apac.account.amazon.com/ap/oa',
					scopes: ['profile', 'advertising::campaign_management'],
					tokenUrl: 'https://api.amazon.co.jp/auth/o2/token',
					userInfoUrl: 'https://api.amazon.co.jp/user/profile',
					pkce: true,
				},
			],
		}),
		passkey(),
	],
});
