import './globals.css';

export const metadata: Metadata = {
	title: 'セラー管理君',
	icons: [
		{
			rel: 'icon',
			type: 'image/png',
			url: '/favicon-96x96.png',
		},
		{
			rel: 'icon',
			type: 'image/svg+xml',
			url: '/favicon.svg',
		},
		{
			rel: 'shortcut icon',
			url: '/favicon.ico',
		},
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			url: '/apple-touch-icon.png',
		},
		{
			rel: 'manifest',
			url: '/site.webmanifest',
		},
	],
	appleWebApp: {
		title: 'セラー管理君',
	},
};

export default function RootLayout({ children }: LayoutProps) {
	return (
		<html lang='ja'>
			<body className='antialiased'>{children}</body>
		</html>
	);
}
