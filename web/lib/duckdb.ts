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

export type MyDuckDB = {
	db: duckdb.AsyncDuckDB;
	c: duckdb.AsyncDuckDBConnection;
};

// DuckDBの初期化
export async function initDuckDB(): Promise<MyDuckDB> {
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

async function createTable(
	myDuckDB: MyDuckDB,
	data: string,
	fileName: string,
	tableName: string,
) {
	// データを登録
	await myDuckDB.db.registerFileText(fileName, data);
	// 既存のテーブルを削除
	await myDuckDB.c.query(`DROP TABLE IF EXISTS ${tableName};`);
	// テーブルを作成
	await myDuckDB.c.query(
		`CREATE TABLE ${tableName} AS SELECT * FROM "${fileName}";`,
	);
}

export async function createSettlementReportTable(
	myDuckDB: MyDuckDB,
	reportData: string,
) {
	// dbの作成
	await createTable(
		myDuckDB,
		reportData,
		'settlement-report.tsv',
		'settlement_report',
	);
	// インデックスの作成と型の変更
	await myDuckDB.c.query(/*sql*/ `
		-- とりあえずposted-dateにインデックスはっとく
		CREATE UNIQUE INDEX report_id ON settlement_report ("posted-date");
		-- -の値がある場合VARCHARになるので一部DOUBLEに変換。Int系でもかも
		ALTER TABLE settlement_report ALTER COLUMN "shipment-fee-amount" SET DATA TYPE DOUBLE;
		ALTER TABLE settlement_report ALTER COLUMN "order-fee-amount" SET DATA TYPE DOUBLE;
		ALTER TABLE settlement_report ALTER COLUMN "misc-fee-amount" SET DATA TYPE DOUBLE;
		ALTER TABLE settlement_report ALTER COLUMN "other-amount" SET DATA TYPE DOUBLE;
		ALTER TABLE settlement_report ALTER COLUMN "direct-payment-amount" SET DATA TYPE DOUBLE;
		`);
}

export async function createSalesTrafficReportTable(
	myDuckDB: MyDuckDB,
	reportData: string,
) {
	await createTable(
		myDuckDB,
		reportData,
		'sales-traffic-report.tsv',
		'sales_traffic_report',
	);

	const salesTraffic = await myDuckDB.c.query(
		'SELECT * from sales_traffic_report',
	);
	console.log(salesTraffic);
	console.log(salesTraffic.toString());
}

export async function createInventoryTable(
	myDuckDB: MyDuckDB,
	inventoryData: string,
) {
	await createTable(
		myDuckDB,
		inventoryData,
		'inventory-summaries.tsv',
		'inventory_summaries',
	);

	const inventory = await myDuckDB.c.query(
		'SELECT * FROM inventory_summaries',
	);
	console.log(inventory);
	console.log(inventory.toString());
}

export async function createCostPriceTable(
	myDuckDB: MyDuckDB,
	costPriceData: string,
) {
	await createTable(myDuckDB, costPriceData, 'cost-price.tsv', 'cost_price');
}

// テーブルがあるかチェック。もうちょっといい方法募集
export async function checkTables(myDuckDB: MyDuckDB, tables: string[]) {
	const result: string[] = [];
	const tablesInDB = await myDuckDB.c.query('SHOW TABLES;');
	const tablesStr = tablesInDB.toString();
	for (const tableName of tables) {
		if (tablesStr.includes(tableName)) {
			result.push(tableName);
		}
	}

	return result;
}
