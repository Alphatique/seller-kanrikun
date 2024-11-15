import type { drizzle } from 'drizzle-orm/libsql';

export type AuthTokenResponse = {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
};

export type CustomVariables = {
	DB: ReturnType<typeof drizzle>;
};
// export * from './amazon';
export * from './seller';
