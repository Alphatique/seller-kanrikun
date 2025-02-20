import { genericOAuthClient, passkeyClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
	baseURL: process.env.SELLER_KANRIKUN_BASE_URL,
	plugins: [genericOAuthClient(), passkeyClient()],
});

export const { signIn, signUp, passkey, useSession, signOut } = client;
