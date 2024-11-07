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
	let userName = undefined;

	const handleLogin = async () => {
		const response = await signIn.oauth2({
			providerId: 'amazon',
			callbackURL: '/',
		});

		userName = session.user.name;
		console.log(response);
	};
	const handleAddSeller = async () => {
		const response = await signIn.oauth2({
			providerId: 'seller',
			callbackURL: '/',
		});
		console.log(response);


	};

	return (
		<div className='flex h-screen flex-col items-center justify-center'>
			{
				session ? (
					<div>
						<p>welcome{userName}</p>
						<Button onClick={handleAddSeller}>seller認証</Button>
					</div>
				) : (
					<div>
						<Button onClick={handleLogin}>ログイン</Button>
						<p>ログインしてください</p>
					</div>
				)
			}

			<p>{session && JSON.stringify(session)}</p>
		</div>
	);
}
