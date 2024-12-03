import type { Metadata } from 'next';
import localFont from 'next/font/local';

import './globals.css';

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
});
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
});

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
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
