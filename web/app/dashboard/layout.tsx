import { headers } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

import { auth } from '@seller-kanrikun/auth/server';

import { Header } from './header';

export default async function Layout({ children }: LayoutProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw redirect('/sign-in', RedirectType.replace);
	}

	return (
		<div className='flex h-screen flex-col'>
			<Header user={session.user} />

			<main className='min-h-0 grow'>{children}</main>
		</div>
	);
}
