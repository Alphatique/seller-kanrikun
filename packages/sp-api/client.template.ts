import createClient from 'openapi-fetch';

import type { paths } from '../schema/${NAME}';

export const ${NAME_CAMEL}Client = createClient<paths>({
    baseUrl: 'https://sellingpartnerapi-fe.amazon.com',
});