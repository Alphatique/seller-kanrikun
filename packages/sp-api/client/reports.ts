import createClient from 'openapi-fetch';

import type { paths } from '../schema/reports';

export const reportsClient = createClient<paths>();