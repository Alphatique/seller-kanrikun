import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema';

export function createDbClient(url: string, authToken: string) {
	const client = createClient({
		url: url,
		authToken: authToken,
	});
	const db = drizzle(client, {
		schema,
	});

	return { client, db };
}

export * from './schema';
