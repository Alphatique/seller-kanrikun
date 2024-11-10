import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Outlet } from '@remix-run/react';
import {
	Calendar,
	ChevronDown,
	Home,
	Inbox,
	Search,
	Settings,
} from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from '@seller-kanrikun/ui';

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
	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									Select Workspace
									<ChevronDown className='ml-auto' />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='w-[--radix-popper-anchor-width]'>
								<DropdownMenuItem>
									<span>Acme Inc</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Acme Corp.</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
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
		</Sidebar>
	);
}
