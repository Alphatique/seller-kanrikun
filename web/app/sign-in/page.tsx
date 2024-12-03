'use client';

import { KeyRoundIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { signIn, useSession } from '@seller-kanrikun/auth/client';
import { Button } from '@seller-kanrikun/ui/components/button';
import { cn } from '@seller-kanrikun/ui/lib/utils';

import AmazonLogo from '../../assets/amazon.svg';
import Logo from '../../assets/logo.svg';

export default function Page() {
	const router = useRouter();
	const { data: session } = useSession();
	const [loading, setLoading] = useState<'amazon' | 'passkey' | false>(false);

	async function signInWithAmazon() {
		setLoading('amazon');

		await signIn
			.oauth2({
				providerId: 'amazon',
			})
			.catch(() => setLoading(false));
	}
	async function signInWithPasskey() {
		setLoading('passkey');

		// Not implemented
		await new Promise(resolve => setTimeout(resolve, 1000));

		setLoading(false);
	}

	useEffect(() => {
		if (session) {
			router.replace('/');
		}
	});

	return (
		<main className='grid w-[25rem] gap-6 rounded-xl bg-background p-8'>
			<div className='flex justify-center gap-1 align-center'>
				<Logo />
				<span className='font-bold text-sm leading-6'>セラー管理君</span>
			</div>

			<div className='grid gap-1'>
				<h1 className='text-center font-bold text-lg'>サインイン</h1>
				<p className='text-center text-muted-foreground text-sm'>
					AmazonまたはPasskeyでサインインしてください
				</p>
			</div>

			<div className='relative grid gap-6'>
				<Button
					variant='outline'
					disabled={Boolean(loading)}
					onClick={signInWithAmazon}
				>
					{loading === 'amazon' ? (
						<Loader2 className='animate-spin' />
					) : (
						<AmazonLogo />
					)}
					Amazonでサインイン
				</Button>

				<div className='relative'>
					<div className='absolute inset-0 flex items-center'>
						<span className='w-full border-t' />
					</div>
					<div className='relative flex justify-center'>
						<span className='bg-background px-2 text-muted-foreground text-xs uppercase'>
							または
						</span>
					</div>
				</div>

				<Button
					variant='outline'
					disabled={Boolean(loading)}
					onClick={signInWithPasskey}
				>
					{loading === 'passkey' ? (
						<Loader2 className='animate-spin' />
					) : (
						<KeyRoundIcon />
					)}
					Passkeyでサインイン
				</Button>

				<div
					className={cn(
						'pointer-events-none absolute inset-0 bg-background opacity-0 transition-opacity',
						loading && 'opacity-50',
					)}
				/>
			</div>
		</main>
	);
}
