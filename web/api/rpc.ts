import { hc } from 'hono/client';

import type { RouteType } from '.';

export const client = hc<RouteType>('/').api;
