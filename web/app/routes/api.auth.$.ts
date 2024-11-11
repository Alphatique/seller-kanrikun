import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

import { auth } from '~/lib/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
	if (
		new URL(request.url).pathname === '/api/auth/oauth2/callback/seller-central'
	) {
		const requestUrl = new URL(request.url);
		const url = new URL(request.url.split('?')[0]);

		if (requestUrl.searchParams.has('spapi_oauth_code')) {
			url.searchParams.set(
				'code',
				requestUrl.searchParams.get('spapi_oauth_code')!,
			);
		}
		if (requestUrl.searchParams.has('state')) {
			url.searchParams.set('state', requestUrl.searchParams.get('state')!);
		}

		return auth.handler(new Request(requestUrl, request));
	}
	return auth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
	return auth.handler(request);
}
