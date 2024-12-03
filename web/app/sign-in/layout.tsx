export default function Layout({ children }: LayoutProps) {
	return (
		<div className='grid h-screen place-content-center bg-muted'>
			{children}
		</div>
	);
}
