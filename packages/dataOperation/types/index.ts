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

export type MyHonoInitializer = {
	Bindings: CloudflareBindings;
	Variables: CustomVariables;
};

// export * from './amazon';
export * from './seller';
