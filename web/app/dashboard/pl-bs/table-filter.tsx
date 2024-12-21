'use client';
import type * as arrow from 'apache-arrow';
import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { useSession } from '@seller-kanrikun/auth/client';
import { calcPlbs } from '@seller-kanrikun/calc/pl-bs';
import { filterCostReportSql } from '@seller-kanrikun/calc/sql/reports';
import { Label } from '@seller-kanrikun/ui/components/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';
import { Switch } from '@seller-kanrikun/ui/components/switch';

import { PopoverMonthRangePicker } from '~/components/popover-month-range-picker';
import { initDuckDB } from '~/lib/duckdb';
import { SWRLoadFile } from '~/lib/opfs';

import { fileLoadedAtom, myDuckDBAtom } from '../client-provider';
import { PlbsTable } from './table';

export function PlbsTableFilter() {
	const { data: session } = useSession();
	const [fileLoaded, setFileLoaded] = useAtom(fileLoadedAtom);
	// duckdbの初期化
	const [myDuckDB, setMyDuckDB] = useAtom(myDuckDBAtom);
	const { data: newDuckDB } = useSWR(
		myDuckDB === null ? 'initDuckdb' : null,
		initDuckDB,
	);
	const { data: reportData } = useSWR(
		session === null || fileLoaded.report ? null : '/api/reports',
		key =>
			SWRLoadFile('settlement-report.tsv.gz', key, session!.session.id),
	);
	const { data: inventoryData } = useSWR(
		session === null || fileLoaded.inventory ? null : '/api/inventory',
		key =>
			SWRLoadFile('inventory-summaries.tsv.gz', key, session!.session.id),
	);
	const { data: costPriceData } = useSWR(
		session === null || fileLoaded.costPrice ? null : '/api/cost-price',
		key => SWRLoadFile('cost-price.tsv.gz', key, session!.session.id),
	);
	const [period, setPeriod] = useState<Period>('monthly');
	// 日付フィルター
	const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
		start: new Date(),
		end: new Date(),
	});
	// 税込みか税抜きか
	const [withTax, setWithTax] = useState(true);

	// 計算したデータ
	const calcDataWithTax = useRef<arrow.Table | null>(null);
	const calcDataWithoutTax = useRef<arrow.Table | null>(null);
	// フィルターしたデータ
	const [filteredData, setFilteredData] = useState<arrow.Table | null>(null);

	// グルーピングしたデータのインデックス
	const [groupedDataIndexes, setGroupedDataIndexes] = useState<
		Record<string, number[]>
	>({});

	const createReportTable = async () => {
		if (!(myDuckDB && reportData && !fileLoaded.report)) return;
		console.log('createReportTable');
		await myDuckDB.db.registerFileText('settlement-report.tsv', reportData);
		await myDuckDB.c.query(/*sql*/ `
			-- データからレポートテーブルを作成
			CREATE TABLE report AS SELECT * FROM "settlement-report.tsv";
			-- とりあえずposted-dateにインデックスはっとく
			CREATE UNIQUE INDEX report_id ON report ("posted-date");
			-- -の値がある場合VARCHARになるので一部DOUBLEに変換。Int系でもかも
			ALTER TABLE report ALTER COLUMN "shipment-fee-amount" SET DATA TYPE DOUBLE;
			ALTER TABLE report ALTER COLUMN "order-fee-amount" SET DATA TYPE DOUBLE;
			ALTER TABLE report ALTER COLUMN "misc-fee-amount" SET DATA TYPE DOUBLE;
			ALTER TABLE report ALTER COLUMN "other-amount" SET DATA TYPE DOUBLE;
			ALTER TABLE report ALTER COLUMN "direct-payment-amount" SET DATA TYPE DOUBLE;
			`);
		fileLoaded.report = true;

		await filterData();
	};

	const createInventoryTable = async () => {
		if (!(myDuckDB && inventoryData && !fileLoaded.inventory)) return;
		console.log('createInventoryTable');
		await myDuckDB.db.registerFileText(
			'inventory-summaries.tsv',
			inventoryData,
		);
		await myDuckDB.c.query(/*sql*/ `
			-- データからインベントリテーブルを作成
			CREATE TABLE inventory_summaries AS SELECT * FROM "inventory-summaries.tsv";
			`);

		fileLoaded.inventory = true;
		await filterData();
	};

	const createCostPriceTable = async () => {
		if (!(myDuckDB && costPriceData && !fileLoaded.costPrice)) return;
		console.log('createCostPriceTable');
		await myDuckDB.db.registerFileText('cost-price.tsv', costPriceData);
		await myDuckDB.c.query(/*sql*/ `
			-- データからコストテーブルを作成
			CREATE TABLE cost_price AS SELECT * FROM "cost-price.tsv";
			`);

		fileLoaded.costPrice = true;
		await filterData();
	};

	const filterData = async () => {
		if (
			!(
				myDuckDB &&
				fileLoaded.report &&
				fileLoaded.inventory &&
				fileLoaded.costPrice
			)
		)
			return;
		const tables = await myDuckDB.c.query('SHOW TABLES;');
		// もうちょっといい方法募集
		const tablesStr = tables.toString();
		if (!tablesStr.includes('report')) {
			fileLoaded.report = false;
			createReportTable();
			return;
		}
		if (!tablesStr.includes('inventory_summaries')) {
			fileLoaded.inventory = false;
			createInventoryTable();
			return;
		}
		if (!tablesStr.includes('cost_price')) {
			fileLoaded.costPrice = false;
			createCostPriceTable();
			return;
		}

		console.log('filterData');
		const filteredData = (await myDuckDB.c.query(
			filterCostReportSql,
		)) as unknown as arrow.Table;

		const withTaxData = calcPlbs(filteredData, true);
		const withoutTaxData = calcPlbs(filteredData, false);

		calcDataWithTax.current = withTaxData;
		calcDataWithoutTax.current = withoutTaxData;
		setFilteredData(filteredData);
	};

	useMemo(() => {
		if (myDuckDB) {
			// Promise.allでまとめたいところ
			if (reportData) {
				createReportTable();
			}
			if (inventoryData) {
				createInventoryTable();
			}
			if (costPriceData) {
				createCostPriceTable();
			}
			if (
				fileLoaded.report &&
				fileLoaded.inventory &&
				fileLoaded.costPrice
			) {
				filterData();
			}
		}
	}, [myDuckDB, reportData, inventoryData, costPriceData]);

	useMemo(() => {
		if (newDuckDB) {
			if (myDuckDB === null) {
				setMyDuckDB(newDuckDB);
			} else {
				newDuckDB.c.close();
				newDuckDB.db.terminate();
			}
		}
	}, [newDuckDB]);
	useMemo(
		async () => {
			// フィルターしたデータがない場合は何もしない
			if (!filteredData) return;
			// 仮データ
			const dateIndexes: Record<string, number[]> = {};
			// データの行数分繰り返す
			for (let i = 0; i < filteredData.numRows; i++) {
				// その行の日付を取得
				const date = new Date(filteredData.getChild('date')!.get(i));
				// 日付が範囲内かどうかを判定
				if (dateRange.start <= date && dateRange.end >= date) {
					// 日付からグループ化する文字列を作成
					let dateStr = '';
					switch (period) {
						case 'monthly':
							dateStr = format(date, 'yyyy-MM');
							break;
						case 'quarterly':
							dateStr = format(date, 'yyyy-Q');
							break;
						case 'yearly':
							dateStr = format(date, 'yyyy');
							break;
					}
					// グループ化したデータを登録
					if (!dateIndexes[dateStr]) {
						// まだグループがない場合は配列初期化
						dateIndexes[dateStr] = [];
					}
					// インデックスを登録
					dateIndexes[dateStr].push(i);
				}
			}
			// グループ化したデータを登録
			setGroupedDataIndexes(dateIndexes);
		},
		[dateRange, filteredData, period], // dateRange, filteredData, periodが更新された場合に反応する
	);
	return (
		<div className='grid gap-3'>
			<div className='flex justify-start gap-3 align-center'>
				<Select
					value={period}
					onValueChange={(value: Period) => {
						setPeriod(value);
					}}
				>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='period' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='monthly'>Monthly</SelectItem>
						<SelectItem value='quarterly'>Quarterly</SelectItem>
						<SelectItem value='yearly'>Yearly</SelectItem>
					</SelectContent>
				</Select>
				<div className='flex items-center space-x-2'>
					<Switch
						id='airplane-mode'
						checked={withTax}
						onCheckedChange={setWithTax}
					/>
					<Label htmlFor='airplane-mode'>Without Tax</Label>
				</div>
				<PopoverMonthRangePicker
					value={dateRange}
					onMonthRangeSelect={setDateRange}
				/>
			</div>
			<PlbsTable
				withTax={withTax}
				groupedDataIndexes={groupedDataIndexes}
				filteredReport={filteredData}
				plbsDataWithTax={calcDataWithTax.current}
				plbsDataWithoutTax={calcDataWithoutTax.current}
			/>
		</div>
	);
}
