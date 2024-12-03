import { Link, Outlet } from '@remix-run/react';
import { useSession } from '@seller-kanrikun/auth/client';
import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';

const items = [
	{
		title: 'Home',
		url: '/app',
		icon: Home,
	},
	{
		title: 'InputPrice',
		url: '/app/input-price',
		icon: Inbox,
	},
	{
		title: 'Calendar',
		url: '#',
		icon: Calendar,
	},
	{
		title: 'Search',
		url: '#',
		icon: Search,
	},
	{
		title: 'Settings',
		url: '#',
		icon: Settings,
	},
];

import { signOut } from '@seller-kanrikun/auth/client';

export default function AppLayout() {
	return (
		<div className='flex h-full w-full flex-col bg-background'>
			<AppHeader />
			<main className='min-h-0 grow overflow-y-auto p-4'>
				<Outlet />
			</main>
		</div>
	);
}

function AppHeader() {
	const { data: session, error: sessionError } = useSession();
	const handleSignOut = async () => {
		const response = await signOut();
		console.log(response);
	};

	if (sessionError) {
		// TODO: loginにリダイレクトしたい人生だった
	}
	return (
		<header className='flex flex-col items-center justify-between bg-emerald-900 text-white'>
			<div className='flex h-14 w-full items-center justify-between border-b-2'>
				<Link to='/app' className='text-3xl'>
					セラー管理くん
				</Link>
				{session ? (
					<div>{session.user.email}</div>
				) : (
					<Link to='/login'>login</Link>
				)}
			</div>
			<div className='flex h-8 w-full justify-between'>
				{items.map(item => (
					<a href={item.url} key={item.title} className='m-auto flex'>
						<item.icon />
						<span>{item.title}</span>
					</a>
				))}
			</div>
		</header>
	);
}
