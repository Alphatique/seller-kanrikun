import type { MetaFunction } from '@remix-run/cloudflare';

import { Button } from '~/components/ui/button';
import { signIn, useSession } from '~/lib/auth-client';

export const meta: MetaFunction = () => {
	return [
		{ title: 'New Remix App' },
		{ name: 'description', content: 'Welcome to Remix!' },
	];
};

export default function Index() {
	const { data: session } = useSession();

	const handleLogin = async () => {
		await signIn.oauth2({
			providerId: 'seller-central',
			callbackURL: '/',
		});
	};

	return (
		<div className='flex h-screen flex-col items-center justify-center'>
			<Button onClick={handleLogin}>ログイン</Button>
			<p>{session && JSON.stringify(session.user)}</p>
		</div>
	);
}
