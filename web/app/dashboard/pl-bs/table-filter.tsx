'use client';
import type * as arrow from 'apache-arrow';
import { format } from 'date-fns';
import { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { useSession } from '@seller-kanrikun/auth/client';
import { calcPlbs } from '@seller-kanrikun/calc/pl-bs';
import { filterReportSql } from '@seller-kanrikun/calc/sql/reports';
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

import { PlbsTable } from './table';

export function PlbsTableFilter() {
	// セッションの取得
	const { data: session } = useSession();
	// duckdbの初期化
	const { data: myDuckDB } = useSWR('initDB', initDuckDB);
	// レポートデータの取得
	const { data: reportData } = useSWR(
		session === null
			? null
			: {
					fileName: 'settlement-report.tsv.gz',
					fetchUrl: '/api/reports',
					sessionId: session.session.id.toString(),
					updateTime: 1000,
				},
		SWRLoadFile,
	);
	const { data: costPriceData } = useSWR(
		session === null
			? null
			: {
					fileName: 'cost-price.tsv.gz',
					fetchUrl: '/api/cost-price',
					sessionId: session.session.id.toString(),
					updateTime: 1000,
				},
		SWRLoadFile,
	);
	const { data: inventoryData } = useSWR(
		session === null
			? null
			: {
					fileName: 'inventory-summaries.tsv.gz',
					fetchUrl: '/api/inventory',
					sessionId: session.session.id.toString(),
					updateTime: 1000,
				},
		SWRLoadFile,
	);

	console.log(inventoryData);

	console.log(reportData);

	// db関連のロードフラグ
	const reportLoaded = useRef(false);
	const costPriceLoaded = useRef(false);

	// グルーピングの期間
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

	// DB関連のロード処理
	useMemo(
		async () => {
			// duckdbがロードされていない場合は何もしない
			if (!myDuckDB) return;
			// レポートデータがロードされていて、ロードフラグがオフの場合
			if (reportData && !reportLoaded.current) {
				// ロードフラグをオン
				reportLoaded.current = true;
				// ロードしたデータを登録
				await myDuckDB.db.registerFileText('report.csv', reportData);

				// レポートテーブルを初期化
				await myDuckDB.c.query(
					/*sql*/ `
						-- データからレポートテーブルを作成
						CREATE TABLE report AS SELECT * FROM report.csv;
						-- とりあえずposted-dateにインデックスはっとく
						CREATE UNIQUE INDEX report_id ON report ("posted-date");
						-- -の値がある場合VARCHARになるので一部DOUBLEに変換。Int系でもかも
						ALTER TABLE report ALTER COLUMN "shipment-fee-amount" SET DATA TYPE DOUBLE;
						ALTER TABLE report ALTER COLUMN "order-fee-amount" SET DATA TYPE DOUBLE;
						ALTER TABLE report ALTER COLUMN "misc-fee-amount" SET DATA TYPE DOUBLE;
						ALTER TABLE report ALTER COLUMN "other-amount" SET DATA TYPE DOUBLE;
						ALTER TABLE report ALTER COLUMN "direct-payment-amount" SET DATA TYPE DOUBLE;
						`,
				);
			}
			// 原価データがロードされていて、ロードフラグがオフの場合
			if (costPriceData && !costPriceLoaded.current) {
				costPriceLoaded.current = true;
				await myDuckDB.db.registerFileText(
					'cost-price.csv',
					costPriceData,
				);
				await myDuckDB.c.query(
					/*sql*/ `
						CREATE TABLE cost_price AS SELECT * FROM "cost-price.csv";
					`,
				);

				const results = await myDuckDB.c.query(
					/*sql*/ `
						SELECT * FROM cost_price;
					`,
				);
				console.log(results.toString());
				console.log(results);
			}

			if (reportLoaded.current && costPriceLoaded.current) {
				// フィルターしたデータを取得
				const filteredRows = (await myDuckDB.c.query(
					filterReportSql,
				)) as unknown as arrow.Table;

				const filteredCost = await myDuckDB.c.query(
					/*sql*/ `
						SELECT
							date_trunc('month', r."posted-date") AS date,
							SUM(cp.price) AS costPrice
						FROM report r
						JOIN cost_price cp
							ON r."posted-date" >= cp.startDate
							AND r."posted-date" <= cp.endDate
						WHERE r."posted-date" IS NOT NULL
						GROUP BY date_trunc('month', r."posted-date");
					`,
				);
				console.log(filteredRows.toString());

				// PLBSデータを計算
				const withTaxData = calcPlbs(
					filteredRows,
					{
						amazonAds: 0,
					},
					false,
				);
				const withoutTaxData = calcPlbs(
					filteredRows,
					{
						amazonAds: 0,
					},
					true,
				);

				// 計算したデータを登録
				calcDataWithTax.current = withTaxData;
				calcDataWithoutTax.current = withoutTaxData;
				// 最後にstateを更新することで再描画を行う
				setFilteredData(filteredRows);
			}
		},
		[myDuckDB, reportData], // duckdbかreportDataが更新された場合に反応する
	);

	// データのグルーピング処理
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
