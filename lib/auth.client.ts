import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
	baseURL: location.origin,
});

export const { signIn, signUp, useSession, signOut } = client;
