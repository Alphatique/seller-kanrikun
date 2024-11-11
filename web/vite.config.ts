import {
	vitePlugin as remix,
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev';
import { defineConfig, loadEnv } from 'vite';

import { parseEnv } from './env';

declare module '@remix-run/cloudflare' {
	interface Future {
		v3_singleFetch: true;
	}
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const parsedEnv = parseEnv(env);

	return {
		plugins: [
			remixCloudflareDevProxy(),
			remix({
				future: {
					v3_fetcherPersist: true,
					v3_relativeSplatPath: true,
					v3_throwAbortReason: true,
					v3_singleFetch: true,
					v3_lazyRouteDiscovery: true,
				},
			}),
		],
		resolve: {
			alias: {
				'~/': `${__dirname}/`,
			},
		},
		define:
			mode === 'production'
				? Object.fromEntries(
						Object.entries(parsedEnv).map(([key, value]) => [
							`process.env.${key}`,
							JSON.stringify(value),
						]),
					)
				: {},
	};
});
