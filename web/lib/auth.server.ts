import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins';

import { db } from '@seller-kanrikun/db';

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'sqlite',
	}),
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'amazon',
					clientId: process.env.AMAZON_CLIENT_ID!,
					clientSecret: process.env.AMAZON_CLIENT_SECRET!,
					authorizationUrl: 'https://apac.account.amazon.com/ap/oa',
					scopes: ['profile'],
					tokenUrl: 'https://api.amazon.co.jp/auth/o2/token',
					userInfoUrl: 'https://api.amazon.com/user/profile',
					pkce: true,
				},
				{
					providerId: 'seller-central',
					clientId: process.env.SP_API_CLIENT_ID!,
					clientSecret: process.env.SP_API_CLIENT_SECRET!,
					authorizationUrl: `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${process.env.SP_API_APPLICATION_ID!}&version=beta`,
					scopes: ['profile'],
					tokenUrl: 'https://api.amazon.com/auth/o2/token',
					userInfoUrl: 'https://api.amazon.com/user/profile',
					pkce: true,
				},
			],
		}),
	],
});
