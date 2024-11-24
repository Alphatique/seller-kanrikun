import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Outlet } from '@remix-run/react';
import { useSession } from '@seller-kanrikun/auth/client';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from '@seller-kanrikun/ui';
import {
	Calendar,
	ChevronUp,
	Home,
	Inbox,
	Search,
	Settings,
} from 'lucide-react';

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
		<SidebarProvider>
			<div className='flex h-full w-full bg-background'>
				<AppSidebar />
				<main className='min-h-0 grow overflow-y-auto p-4'>
					<Outlet />
				</main>
			</div>
		</SidebarProvider>
	);
}

function AppSidebar() {
	const { data: session, error } = useSession();
	const handleSignOut = async () => {
		const response = await signOut();
		console.log(response);
	};

	if (error) {
		// TODO: loginにリダイレクトしたい人生だった
	}

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Seller-kanrikun</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map(item => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						{session ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton>
										{session.user.email}
										<ChevronUp className='ml-auto' />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									side='top'
									className='w-[--radix-popper-anchor-width]'
								>
									<DropdownMenuItem onClick={handleSignOut}>
										<span>Sign out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<SidebarMenuButton asChild>
								<a href='/login'>
									<span>Login</span>
								</a>
							</SidebarMenuButton>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
