'use client';

import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';

// バンドルの指定
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

// DuckDBの初期化
export async function initDuckDB(): Promise<{
	db: duckdb.AsyncDuckDB;
	c: duckdb.AsyncDuckDBConnection;
}> {
	// バンドルの読み込み
	const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
	const worker = new Worker(bundle.mainWorker!);
	const logger = new duckdb.ConsoleLogger();

	console.log('initDuckDB');

	// DuckDBの初期化
	const db = new duckdb.AsyncDuckDB(logger, worker);
	// ワーカースレッドの初期化
	await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
	// 接続
	const c = await db.connect();
	// db本体と接続を返す
	return { db, c };
}
