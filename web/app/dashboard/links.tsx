'use client';

import {
	BlocksIcon,
	DollarSignIcon,
	HouseIcon,
	ListIcon,
	ScaleIcon,
	Settings2Icon,
	TrendingUpIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

import { buttonVariants } from '@seller-kanrikun/ui/components/button';
import { cn } from '@seller-kanrikun/ui/lib/utils';

type HeaderItem = {
	title: string;
	icon: React.ReactNode;
	href: string;
};

const items: HeaderItem[] = [
	{
		title: 'ホーム',
		icon: <HouseIcon />,
		href: '/',
	},
	{
		title: 'PL/BS',
		icon: <ScaleIcon />,
		href: '/pl-bs',
	},
	{
		title: '商品',
		icon: <ListIcon />,
		href: '/items',
	},
	{
		title: '仕入れ',
		icon: <BlocksIcon />,
		href: '/stocking',
	},
	{
		title: 'セッション/CVR',
		icon: <TrendingUpIcon />,
		href: '/session-cvr',
	},
	{
		title: '原価入力',
		icon: <DollarSignIcon />,
		href: '/input-price',
	},
	{
		title: '設定',
		icon: <Settings2Icon />,
		href: '/settings',
	},
];

export function HeaderLinks() {
	const segment = useSelectedLayoutSegment();

	return (
		<div className='-mt-2 flex flex-wrap justify-center'>
			{items.map(({ title, icon, href }) => (
				<Link
					href={`/dashboard/${href}`}
					key={href}
					className={cn(
						buttonVariants({ variant: 'ghost' }),
						'relative h-10 rounded-none text-background transition-none hover:bg-teal-900 hover:text-background',
					)}
				>
					{icon}
					{title}
					{href === (segment ? `/${segment}` : '/') && (
						<div className='absolute bottom-0 w-full border-b-[3px]' />
					)}
				</Link>
			))}
		</div>
	);
}
