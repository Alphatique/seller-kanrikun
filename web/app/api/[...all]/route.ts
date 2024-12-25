import { handle } from 'hono/vercel';

import { app } from '~/api';

const handler = handle(app);

export const GET = handler;
export const POST = handler;
