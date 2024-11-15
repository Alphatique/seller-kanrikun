import { createClient as createLibsqlClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema';

export function createClient(config: {
	url: string;
	authToken: string;
}) {
	const client = createLibsqlClient(config);
	const db = drizzle(client, {
		schema,
	});

	return db;
}

export type ClientType = ReturnType<typeof createClient>;

export * as schema from './schema';
