import { headers } from 'next/headers';

import { auth } from '@seller-kanrikun/auth/server';

import { SignIn } from '~/components/signIn';

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<>
			<SignIn />
			<p>{JSON.stringify(session, null, 4)}</p>
		</>
	);
}
