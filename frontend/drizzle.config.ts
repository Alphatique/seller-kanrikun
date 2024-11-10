import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'turso',
	schema: './db/schema.server.ts',
	out: './migrations',
	dbCredentials: {
		url: process.env.TURSO_CONNECTION_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	},
});
