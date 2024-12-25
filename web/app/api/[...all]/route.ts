import { handle } from 'hono/vercel';

import { app } from '~/api';

const handler = handle(app);

function _handler(req: Request) {
	console.log(req.url);
	return handler(req);
}

export const GET = _handler;
export const POST = _handler;
