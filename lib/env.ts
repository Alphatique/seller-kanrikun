import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		// Auth
		BETTER_AUTH_URL: z.string().url(),
		BETTER_AUTH_SECRET: z.string(),

		AMAZON_CLIENT_ID: z.string(),
		AMAZON_CLIENT_SECRET: z.string(),

		SP_API_CLIENT_ID: z.string(),
		SP_API_CLIENT_SECRET: z.string(),

		// Database
		TURSO_CONNECTION_URL: z.string().url(),
		TURSO_AUTH_TOKEN: z.string(),
	},

	runtimeEnv: process.env,
});
