import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ログイン | セラー管理君',
};

export default function Layout({ children }: LayoutProps) {
	return (
		<div className='grid h-screen place-content-center bg-muted'>
			{children}
		</div>
	);
}
