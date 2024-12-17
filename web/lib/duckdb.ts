'use client';
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';

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

export async function initDuckDB(): Promise<{
	db: duckdb.AsyncDuckDB;
	c: duckdb.AsyncDuckDBConnection;
} | null> {
	const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
	const worker = new Worker(bundle.mainWorker!);
	const logger = new duckdb.ConsoleLogger();
	const db = new duckdb.AsyncDuckDB(logger, worker);
	await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
	const c = await db.connect();
	return { db, c };
}
