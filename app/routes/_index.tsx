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

	const handleLogin = async (providerId: string) => {
		const response = await signIn.oauth2({
			providerId: providerId,
			callbackURL: '/',
		});

		console.log(response);
	};

	return (
		<div className='flex h-screen flex-col items-center justify-center'>
			{session ? (
				<div>
					<p>welcome{userName}</p>
					<Button onClick={()=>{handleLogin('seller-central')}}>seller認証</Button>
				</div>
			) : (
				<div>
					<Button onClick={()=>{handleLogin('amazon')}}>ログイン</Button>
					<p>ログインしてください</p>
				</div>
			)}

			<p>{session && JSON.stringify(session)}</p>
		</div>
	);
}
