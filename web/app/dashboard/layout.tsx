import type { User } from 'better-auth';
import { RedirectType, redirect } from 'next/navigation';

import { ScrollArea } from '@seller-kanrikun/ui/components/scroll-area';
import { ConfirmDialogProvider } from '@seller-kanrikun/ui/confirm-dialog';

import { getSession } from '~/lib/session';

import { ClientProvider } from './client-provider';
import { Header } from './header';

export default async function Layout({ children }: LayoutProps) {
	const session = await getSession();

	if (!session) {
		throw redirect('/sign-in', RedirectType.replace);
	}

	return (
		<ConfirmDialogProvider
			defaultOptions={{
				alertDialogContent: {
					className: 'p-4',
				},
				cancelButton: {
					variant: 'outline',
				},
				cancelText: 'キャンセル',
			}}
		>
			<div className='flex h-screen flex-col'>
				<Header user={session.user as User} />
				<ScrollArea className='min-h-0 grow'>
					<main className='container mx-auto py-6'>
						<ClientProvider>{children}</ClientProvider>
					</main>
				</ScrollArea>
			</div>
		</ConfirmDialogProvider>
	);
}
