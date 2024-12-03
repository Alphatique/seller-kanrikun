import { headers } from 'next/headers';
import Link from 'next/link';

import { auth } from '@seller-kanrikun/auth/server';

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<>
			<Link href='/sign-in'>SignIn</Link>
			<p>session:</p>
			<p>{JSON.stringify(session, null, 4)}</p>
		</>
	);
}
