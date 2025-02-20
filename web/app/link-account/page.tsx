'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSession } from '@seller-kanrikun/auth/client';
import { Button } from '@seller-kanrikun/ui/components/button';
import { cn } from '@seller-kanrikun/ui/lib/utils';

//import amazonLogo from '~/assets/amazon.svg';

export default function Page() {
	const router = useRouter();
	const { data: session } = useSession();
	const [loading, setLoading] = useState<'seller-central' | false>(false);

	async function linkSellerCentral() {
		setLoading('seller-central');

		try {
			router.replace('/api/link-account');
		} catch (e) {
			setLoading(false);
		}
	}

	return (
		<main className='grid w-[25rem] gap-6 rounded-xl bg-background p-8'>
			<div className='flex items-center justify-center gap-1'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='1'
					strokeLinecap='round'
					strokeLinejoin='round'
					className='size-6'
				>
					<title>logo</title>
					<path
						d='M10.5 2.75a1.5 1.5 0 0 1 3 0h1.5a1 1 0 0 1 1 1v0.5a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-0.5a1 1 0 0 1 1 -1h1'
						fill='lightskyblue'
					/>
					<path d='M13.625 7.625a3 3 0 1 0 1.625 2.625' />
					<path d='m10.5 10 1.5 1.5 3-3' />

					<path d='M16.5 4h0.5a2 2 0 0 1 2 2v14.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1' />

					<path d='M12 16h4.5' />
					<path d='M12 19.75h4.5' />
					<rect
						width='2.5'
						height='2.5'
						x='7.5'
						y='14.75'
						rx='0.5'
						ry='0.5'
						fill='lightskyblue'
					/>
					<rect
						width='2.5'
						height='2.5'
						x='7.5'
						y='18.5'
						rx='0.5'
						ry='0.5'
						fill='lightskyblue'
					/>
				</svg>
				<span className='font-bold text-sm leading-6'>
					セラー管理くん
				</span>
			</div>

			<div className='grid gap-1'>
				<h1 className='text-center font-bold text-lg'>
					リンクアカウント
				</h1>
				<p className='text-center text-muted-foreground text-sm'>
					SP-APIをリンクする
				</p>
			</div>

			<div className='relative grid gap-6'>
				<Button
					variant='outline'
					disabled={Boolean(loading)}
					onClick={linkSellerCentral}
				>
					{loading === 'seller-central' ? (
						<Loader2 className='animate-spin' />
					) : (
						<Image
							src='' //src={amazonLogo}
							alt='amazon logo'
							className='size-4'
						/>
					)}
					SP-APIでログイン
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
