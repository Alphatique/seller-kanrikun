import { genericOAuthClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
	plugins: [genericOAuthClient()],
});

export const { signIn, signUp, useSession, signOut } = client;
