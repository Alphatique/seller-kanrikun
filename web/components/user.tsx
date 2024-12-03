'use client';

import type { User as UserType } from 'better-auth';
import { useRouter } from 'next/navigation';

import { signOut } from '@seller-kanrikun/auth/client';
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

interface Props {
	user: UserType;
}

export function User({ user }: Props) {
	const router = useRouter();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='relative size-8 rounded-full'>
					<Avatar>
						<AvatarImage src={user.image ?? undefined} alt={user.name} />
						<AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='end'>
				<DropdownMenuLabel>
					<div className='flex flex-col gap-1'>
						<p className='text-center font-medium text-sm leading-none'>
							{user.name}
						</p>
						<p className='text-center text-muted-foreground text-xs leading-none'>
							{user.email}
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
