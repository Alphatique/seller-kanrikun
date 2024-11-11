import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '@seller-kanrikun/db';

import { genericOAuth } from './generic-auth';

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
					userInfoUrl: 'https://api.amazon.co.jp/user/profile',
					pkce: true,
				},
				{
					providerId: 'seller-central',
					clientId: process.env.SP_API_CLIENT_ID!,
					clientSecret: process.env.SP_API_CLIENT_SECRET!,
					authorizationUrl: `https://sellercentral.amazon.co.jp/apps/authorize/consent?application_id=${process.env.SP_API_APPLICATION_ID!}&version=beta`,
					scopes: ['profile'],
					tokenUrl: 'https://api.amazon.co.jp/auth/o2/token',
					userInfoUrl: 'https://api.amazon.co.jp/user/profile',
					pkce: true,
				},
			],
		}),
	],
});
