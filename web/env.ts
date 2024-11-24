import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// This is used in build phase. DON'T import this.

export function parseEnv(runtimeEnv: Record<string, string | undefined>) {
	return createEnv({
		server: {
			// Auth
			BETTER_AUTH_URL: z.string().url(),
			BETTER_AUTH_SECRET: z.string(),

			AMAZON_CLIENT_ID: z.string(),
			AMAZON_CLIENT_SECRET: z.string(),

			SP_API_CLIENT_ID: z.string(),
			SP_API_CLIENT_SECRET: z.string(),
			SP_API_APPLICATION_ID: z.string(),

			// Database
			TURSO_CONNECTION_URL: z.string().url(),
			TURSO_AUTH_TOKEN: z.string(),

			// R2
			CLOUDFLARE_R2_ENDPOINT: z.string().url(),
			CLOUDFLARE_R2_ACCESS_KEY: z.string(),
			CLOUDFLARE_R2_SECRET_KEY: z.string(),
		},

		runtimeEnv,
	});
}
