'use client';
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
import type { Session as SessionType } from 'better-auth';
import { useState } from 'react';

import { useSession } from '@seller-kanrikun/auth/client';

import { gunzipSync } from 'fflate';
import { loadFile } from '~/lib/opfs';

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
	mvp: {
		mainModule: duckdb_wasm,
		mainWorker:
			global.window &&
			new URL(
				'@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js',
				import.meta.url,
			).toString(),
	},
	eh: {
		mainModule: duckdb_wasm_eh,
		mainWorker:
			global.window &&
			new URL(
				'@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js',
				import.meta.url,
			).toString(),
	},
};

const initDuckDB = async (
	setMyDuckDB: React.Dispatch<
		React.SetStateAction<duckdb.AsyncDuckDB | null>
	>,
	session: SessionType,
) => {
	const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
	const worker = new Worker(bundle.mainWorker!);
	const logger = new duckdb.ConsoleLogger();
	const db = new duckdb.AsyncDuckDB(logger, worker);
	await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
	const c = await db.connect();

	console.log('Connected to DuckDB', c);

	setMyDuckDB(db);

	const reportData = await loadFile(
		'settlement-report.tsv.gz',
		updateTime,
		async () => {
			if (!session) return undefined;
			const sessionId: string = session.id.toString();
			const response = await fetch('/api/reports', {
				method: 'GET',
				headers: {
					'x-seller-kanrikun-session-id': sessionId,
				},
			});
			if (response.ok) {
				const data = await response.arrayBuffer();
				return new Uint8Array(data);
			} else {
				const error = await response.text();
				console.error('Failed to fetch report data:', response, error);
				return await undefined;
			}
		},
	);
	if (reportData === null) return;
	console.log('Report data:', reportData);
	const decompressed = gunzipSync(reportData);

	const decoder = new TextDecoder();
	const csvContent: string = decoder.decode(decompressed);

	await db.registerFileText('report.csv', csvContent);
	const selectAll = await c.query('SELECT * FROM report.csv;');

	console.log('Report data from DuckDB:', selectAll);

	console.log('Decompressed report data:', csvContent);
};

// 1 week
const updateTime = 7 * 24 * 60 * 60 * 1000;

export function MyDuckDBComponent() {
	const [myDuckDB, setMyDuckDB] = useState<duckdb.AsyncDuckDB | null>(null);
	const { data: session } = useSession();

	return (
		<div>
			{session ? (
				<button
					onClick={() =>
						initDuckDB(setMyDuckDB, session.session as SessionType)
					}
				>
					Init DuckDB
				</button>
			) : (
				<></>
			)}
		</div>
	);
}
