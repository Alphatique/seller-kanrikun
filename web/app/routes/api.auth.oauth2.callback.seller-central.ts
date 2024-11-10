import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

import { auth } from '~/lib/auth.server';

export function loader({ request }: LoaderFunctionArgs) {
	const requestUrl = new URL(request.url);
	const redirectUrl = new URL(
		'/api/auth/oauth2/callback/seller-central',
		request.url,
	);

	redirectUrl.searchParams.set(
		'code',
		requestUrl.searchParams.get('spapi_oauth_code') ?? '',
	);
	redirectUrl.searchParams.set(
		'state',
		requestUrl.searchParams.get('state') ?? '',
	);

	return auth.handler(new Request(requestUrl, request));
}
