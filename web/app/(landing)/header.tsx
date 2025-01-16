'use client';

import type { User as UserType } from 'better-auth';
import Link from 'next/link';

import { useSession } from '@seller-kanrikun/auth/client';
import { buttonVariants } from '@seller-kanrikun/ui/components/button';
import { cn } from '@seller-kanrikun/ui/lib/utils';

import { User } from '~/components/user';

export function Header() {
	const { data: session } = useSession();

	return (
		<header className='min-h-0 shrink-0 bg-teal-800'>
			<div className='flex h-16 items-center px-6'>
				<Link href='/' className='flex items-center gap-1'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='1'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='size-10'
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

					<h1 className='select-none font-semibold text-background text-lg'>
						セラー管理くん
					</h1>
				</Link>

				<div className='grow' />

				<div className='flex items-center gap-4'>
					{session ? (
						<>
							<Link
								href='/dashboard'
								className={cn(
									buttonVariants({ variant: 'link' }),
									'text-background',
								)}
								key='dashboard'
							>
								ダッシュボード
							</Link>
							<User user={session.user as UserType} />
						</>
					) : (
						<Link
							href='/sign-in'
							className={cn(
								buttonVariants({ variant: 'secondary' }),
							)}
							key='sign-in'
						>
							サインイン
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
