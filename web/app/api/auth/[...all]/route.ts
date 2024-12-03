import { auth } from '@seller-kanrikun/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth.handler);
