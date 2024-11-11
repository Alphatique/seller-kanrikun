import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

import { auth } from '~/lib/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
	if (
		new URL(request.url).pathname === '/api/auth/oauth2/callback/seller-central'
	) {
		const url = new URL(request.url);

		if (url.searchParams.has('spapi_oauth_code')) {
			url.searchParams.set('code', url.searchParams.get('spapi_oauth_code')!);
			url.searchParams.delete('spapi_oauth_code');
		}

		return auth.handler(new Request(url, request));
	}
	return auth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
	return auth.handler(request);
}
