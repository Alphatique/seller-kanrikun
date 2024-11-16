import type { ClientType } from '@seller-kanrikun/db';

export type AuthTokenResponse = {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
};

export type CustomVariables = {
	DB: ClientType;
};

interface CloudflareBindings {
	AMAZON_CLIENT_ID: string;
	AMAZON_CLIENT_SECRET: string;
	SP_API_APPLICATION_ID: string;
	SP_API_CLIENT_ID: string;
	SP_API_CLIENT_SECRET: string;
	TURSO_CONNECTION_URL: string;
	TURSO_AUTH_TOKEN: string;
	MY_WEB_ORIGIN: string;
}

export type MyHonoInitializer = {
	Bindings: CloudflareBindings;
	Variables: CustomVariables;
};

// export * from './amazon';
export * from './seller';
