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
	await myDuckDB.c.query(/*sql*/ `DROP TABLE IF EXISTS ${tableName};`);
	// テーブルを作成
	await myDuckDB.c.query(/*sql*/ `
		CREATE TABLE ${tableName} AS SELECT * FROM "${fileName}";
	`);
}

export async function createSettlementReportTable(
	myDuckDB: MyDuckDB,
	reportData: string,
) {
	// dbの作成
	await createTable(
		myDuckDB,
		reportData,
		'settlement-report.json',
		'settlementReport',
	);
	// インデックスの作成と型の変更
	await myDuckDB.c.query(/*sql*/ `
		ALTER TABLE settlementReport ALTER COLUMN postedDate SET DATA TYPE DATE;
		CREATE INDEX reportId ON settlementReport (postedDate);

		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS priceAmount INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS itemRelatedFeeAmount INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS promotionAmount INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS shipmentFeeAmount INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS orderFeeAmount INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS miscFeeAmount INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS otherFeeAmount INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS otherAmount INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS priceType Utf8 NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS promotionType Utf8 NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS itemRelatedFeeType Utf8 NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS otherFeeReasonDescription Utf8 NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS depositDate DATE NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS currency Utf8 NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS marketplaceName Utf8 NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS quantityPurchased INT NULL;
		ALTER TABLE settlementReport ADD COLUMN IF NOT EXISTS promotionId Utf8 NULL;
	`);
	const table = await myDuckDB.c.query('SELECT * FROM settlementReport');
	console.log(table);
}

export async function createSalesTrafficReportTable(
	myDuckDB: MyDuckDB,
	reportData: string,
) {
	await createTable(
		myDuckDB,
		reportData,
		'sales-traffic-report.json',
		'salesTrafficReport',
	);
	await myDuckDB.c.query(/*sql*/ `
		ALTER TABLE salesTrafficReport ALTER COLUMN dataStartTime SET DATA TYPE DATE;
		ALTER TABLE salesTrafficReport ALTER COLUMN dataEndTime SET DATA TYPE DATE;
	`);
	const table = await myDuckDB.c.query(
		/*sql*/ 'SELECT * FROM salesTrafficReport',
	);
	console.log(table);
}

export async function createInventoryTable(
	myDuckDB: MyDuckDB,
	inventoryData: string,
) {
	await createTable(
		myDuckDB,
		inventoryData,
		'inventory-summaries.json',
		'inventorySummaries',
	);
}

export async function createCostPriceTable(
	myDuckDB: MyDuckDB,
	costPriceData: string,
) {
	await createTable(myDuckDB, costPriceData, 'cost-price.json', 'costPrice');
	await myDuckDB.c.query(/*sql*/ `
		ALTER TABLE costPrice ALTER COLUMN startDate SET DATA TYPE DATE;
		ALTER TABLE costPrice ALTER COLUMN endDate SET DATA TYPE DATE;
	`);
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
