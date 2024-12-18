'use client';
import type * as arrow from 'apache-arrow';
import { format } from 'date-fns';
import { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { useSession } from '@seller-kanrikun/auth/client';
import { calcPlbs } from '@seller-kanrikun/calc/pl-bs';
import { getFilterReportSql } from '@seller-kanrikun/calc/sql/reports';
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

	// db関連のロードフラグ
	const reportLoaded = useRef(false);

	// フィルタリング関連
	const [period, setPeriod] = useState<Period>('monthly');
	const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
		start: new Date(),
		end: new Date(),
	});
	const [withTax, setWithTax] = useState(true);

	const calcDataWithTax = useRef<arrow.Table | null>(null);
	const calcDataWithoutTax = useRef<arrow.Table | null>(null);
	const [filteredData, setFilteredData] = useState<arrow.Table | null>(null);

	const [groupedDataIndexes, setGroupedDataIndexes] = useState<
		Record<string, number[]>
	>({});

	// DB関連のロード処理
	useMemo(async () => {
		if (myDuckDB) {
			if (reportData && !reportLoaded.current) {
				reportLoaded.current = true;
				await myDuckDB.db.registerFileText('report.csv', reportData);
				console.log(myDuckDB.db);
				// テーブル名を表示
				await myDuckDB.c.query(
					/*sql*/ `
					CREATE TABLE report AS SELECT * FROM report.csv;
					`,
				);
				// -の値がある場合VARCHARになるので手でDOUBLEに変換。Int系のがいいかも
				await myDuckDB.c.query(
					/*sql*/ `
					ALTER TABLE report ALTER COLUMN "shipment-fee-amount" SET DATA TYPE DOUBLE;
					ALTER TABLE report ALTER COLUMN "order-fee-amount" SET DATA TYPE DOUBLE;
					ALTER TABLE report ALTER COLUMN "misc-fee-amount" SET DATA TYPE DOUBLE;
					ALTER TABLE report ALTER COLUMN "other-amount" SET DATA TYPE DOUBLE;
					ALTER TABLE report ALTER COLUMN "direct-payment-amount" SET DATA TYPE DOUBLE;
					`,
				);

				const filteredRows = (await myDuckDB.c.query(
					getFilterReportSql(),
				)) as unknown as arrow.Table;

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

				calcDataWithTax.current = withTaxData;
				calcDataWithoutTax.current = withoutTaxData;
				setFilteredData(filteredRows);
			}
		}
	}, [myDuckDB, reportData]);

	useMemo(async () => {
		if (!filteredData) return;
		if (!filteredData.getChild('date')) return;
		const dateIndexes: Record<string, number[]> = {};
		for (let i = 0; i < filteredData.numRows; i++) {
			const date = new Date(filteredData.getChild('date')!.get(i));
			console.log(date);
			console.log(dateRange);
			if (dateRange.start <= date && dateRange.end >= date) {
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
				if (!dateIndexes[dateStr]) {
					dateIndexes[dateStr] = [];
				}
				dateIndexes[dateStr].push(i);
			}
		}
		setGroupedDataIndexes(dateIndexes);
	}, [dateRange, filteredData, period]);

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
