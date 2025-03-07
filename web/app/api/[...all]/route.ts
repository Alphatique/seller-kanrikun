import { handle } from 'hono/vercel';

import { app } from '~/server';

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
