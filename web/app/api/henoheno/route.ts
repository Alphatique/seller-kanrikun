import { getInventoryData } from '@seller-kanrikun/api-fetch';

export async function GET(request: Request) {
	const accessToken = '';
	await getInventoryData(accessToken);
	return new Response('henohenomoheji', {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}
