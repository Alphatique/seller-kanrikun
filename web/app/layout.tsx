import './globals.css';
import type { Metadata } from 'next';

// ① これを追加
import { VercelAnalytics } from './vercel-analytics';

export const metadata: Metadata = {
	title: 'セラー管理くん',
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
		title: 'セラー管理くん',
	},
};

interface LayoutProps {
	children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
	return (
		<html lang='ja'>
			<body className='antialiased'>
				{children}
				{/* ② ここに VercelAnalytics を呼び出す */}
				<VercelAnalytics />
			</body>
		</html>
	);
}
