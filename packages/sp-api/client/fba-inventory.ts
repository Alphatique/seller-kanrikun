import createClient from 'openapi-fetch';

import type { paths } from '../schema/fba-inventory';

export const fbaInventoryClient = createClient<paths>();