import { BaselimeLogger } from '@baselime/edge-logger';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

// @ts-ignore
import * as build from '../build/server';

// @ts-ignore
const handler = createPagesFunctionHandler({ build });

export function onRequest(context: EventContext<Env, string, unknown>) {
	const url = new URL(context.request.url);
	const logger = new BaselimeLogger({
		service: 'seller-kanrikun',
		namespace: `${context.request.method} ${url.hostname}${url.pathname}`,
		apiKey: context.env.BASELIME_API_KEY,
		ctx: context,
		isLocalDev: !context.env.BASELIME_API_KEY,
	});

	context.waitUntil(logger.flush());

	return handler(context);
}
