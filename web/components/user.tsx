'use client';

import { useRouter } from 'next/navigation';

import { signOut, useSession } from '@seller-kanrikun/auth/client';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@seller-kanrikun/ui/components/avatar';
import { Button } from '@seller-kanrikun/ui/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@seller-kanrikun/ui/components/dropdown-menu';

export function User() {
	const router = useRouter();
	const { data: session } = useSession();

	if (!session) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='relative size-8 rounded-full'>
					<Avatar>
						<AvatarImage
							src={session.user.image ?? undefined}
							alt={session.user.name}
						/>
						<AvatarFallback>
							{session.user.name[0].toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='end'>
				<DropdownMenuLabel>
					<div className='flex flex-col gap-1'>
						<p className='text-center font-medium text-sm leading-none'>
							{session.user.name}
						</p>
						<p className='text-center text-muted-foreground text-xs leading-none'>
							{session.user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () => {
						await signOut();
						router.push('/sign-in');
					}}
				>
					<span className='w-full text-center text-red-600'>サインアウト</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
