import createClient from 'openapi-fetch';

import type { paths } from '../schema/catalog-items';

export const catalogItemsClient = createClient<paths>({
	baseUrl: 'https://sellingpartnerapi-fe.amazon.com',
});
