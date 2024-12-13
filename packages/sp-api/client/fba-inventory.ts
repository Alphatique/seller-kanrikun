import createClient from 'openapi-fetch';

import type { paths } from '../schema/fba-inventory';

export const fbaInventoryClient = createClient<paths>({
	baseUrl: 'https://sellingpartnerapi-fe.amazon.com',
	headers: {
		'x-amz-access-token': '',
	},
});
