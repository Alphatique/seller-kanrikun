import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getReadOnlySignedUrl } from '../r2.server';

export async function action({ request, context }: ActionFunctionArgs) {
	const userId = await request.text();
	const readUrl = await getReadOnlySignedUrl(userId, 'report.gzip'); // 多分expireをうまく活かせてない
	const response = await fetch(readUrl);

	return new Response(response.body, {
		status: response.status,
		headers: {
			'Content-Type':
				response.headers.get('Content-Type') || 'application/json',
		},
	});
}
