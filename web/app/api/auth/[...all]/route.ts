import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@seller-kanrikun/auth/server';

export const { GET, POST } = toNextJsHandler(auth.handler);
