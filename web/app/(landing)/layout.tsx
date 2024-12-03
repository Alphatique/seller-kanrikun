import { Header } from './header';

export default function Layout({ children }: LayoutProps) {
	return (
		<div className='flex h-screen flex-col'>
			<Header />

			<main className='min-h-0 grow'>{children}</main>
		</div>
	);
}
