import { headers } from 'next/headers';
import { cache } from 'react';

import { auth } from '@seller-kanrikun/auth/server';

export const getSession = cache(async () => {
	return await auth.api.getSession({
		headers: await headers(),
	});
});

export const listSessions = cache(async () => {
	return await auth.api.listSessions({
		headers: await headers(),
	});
});
