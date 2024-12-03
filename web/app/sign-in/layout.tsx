export const metadata: Metadata = {
	title: 'サインイン | セラー管理君',
};

export default function Layout({ children }: LayoutProps) {
	return (
		<div className='grid h-screen place-content-center bg-muted'>
			{children}
		</div>
	);
}
