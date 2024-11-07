import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '~/lib/env';

import * as schema from './schema.server';

const client = createClient({
	url: env.TURSO_CONNECTION_URL!,
	authToken: env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, {
	schema,
});
