import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins';

import { db } from '~/db/index.server';

import { env } from './env';

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'sqlite',
	}),
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'amazon',
					clientId: env.AMAZON_CLIENT_ID,
					clientSecret: env.AMAZON_CLIENT_SECRET,
					authorizationUrl: 'https://apac.account.amazon.com/ap/oa',
					scopes: ['profile'],
					tokenUrl: 'https://api.amazon.co.jp/auth/o2/token',
					userInfoUrl: 'https://api.amazon.com/user/profile',
					pkce: true,
				},
				{
					providerId: 'seller',
					clientId: env.SELLER_CLIENT_ID,
					clientSecret: env.SELLER_CLIENT_SECRET,
					authorizationUrl: 'https://sellercentral.amazon.com/apps/authorize/consent',
					scopes: ['profile'],
					tokenUrl: 'https://api.amazon.com/auth/o2/token',
					userInfoUrl: 'https://api.amazon.com/user/profile',
					pkce: true,
				}
			],
		}),
	],
});
