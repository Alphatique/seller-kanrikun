import { execSync } from 'node:child_process';
import type { NextConfig } from 'next';
import { DefinePlugin } from 'webpack';

const nextConfig: NextConfig = {
	transpilePackages: ['@seller-kanrikun/db', '@seller-kanrikun/ui'],
	webpack: (config, { nextRuntime }) => {
		if (nextRuntime === 'edge' || nextRuntime === 'nodejs') {
			const env = JSON.parse(
				execSync('bunx dotenvx get -f ../.env').toString(),
			);

			const defines: Record<string, string> = {};

			for (const [key, value] of Object.entries(env)) {
				defines[`process.env.${key}`] = JSON.stringify(value);
			}

			config.plugins.push(new DefinePlugin(defines));
		}

		return config;
	},
};

export default nextConfig;
