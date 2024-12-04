'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@seller-kanrikun/auth/server';

export async function signOutAllSessions() {
	await auth.api.revokeSessions({
		headers: await headers(),
	});

	throw redirect('/sign-in');
}
