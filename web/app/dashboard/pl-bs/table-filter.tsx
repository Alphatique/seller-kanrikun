'use client';
import type { Table } from 'apache-arrow';
import { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { useSession } from '@seller-kanrikun/auth/client';
import { filterMonthlyReport } from '@seller-kanrikun/calc/sql/reports';
import { Label } from '@seller-kanrikun/ui/components/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';
import { Switch } from '@seller-kanrikun/ui/components/switch';
import {
	TableBody,
	TableCell,
	Table as TableComponent, // apache-arrowと被るので割り食ってもらってる。多分分析用のスクリプト分割するのが正解
} from '@seller-kanrikun/ui/components/table';

import { PopoverMonthRangePicker } from '~/components/popover-month-range-picker';
import { initDuckDB } from '~/lib/duckdb';
import { SWRLoadFile } from '~/lib/opfs';

import {
	bsTableWithTax,
	bsTableWithoutTax,
	indexTable,
	plTableWithTax,
	plTableWithoutTax,
} from './table-meta';
import { HeadTableRow, IndentTableCell, PlbsTableRow } from './table-pl-bs';

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
	const duckdbLoaded = useRef(false);

	// DB関連のロード処理
	useMemo(async () => {
		if (myDuckDB) {
			if (reportData && !reportLoaded.current) {
				reportLoaded.current = true;
				await myDuckDB.db.registerFileText('report.csv', reportData);

				//downloadStr(reportData, 'report.csv');

				// テーブル名を表示
				await myDuckDB.c.query(
					/*sql*/ `
					CREATE TABLE report AS SELECT * FROM report.csv;
					`,
				);
				// -の値がある場合VARCHARになるので手でDOUBLEに変換
				await myDuckDB.c.query(
					/*sql*/ `
					ALTER TABLE report ALTER COLUMN "other-amount" SET DATA TYPE DOUBLE;
					`,
				);

				const monthlyReportData: Table =
					await myDuckDB.c.query(filterMonthlyReport);

				const monthlyUnpaidBalance: Table = await myDuckDB.c.query(
					/*sql*/ `SELECT
						strftime(date_trunc('month', "deposit-date"), '%Y-%B') AS date,
						SUM("total-amount") AS fbaWeightBasedFee,
					FROM report
					GROUP BY date_trunc('month', "deposit-date");
					`,
				);
				console.log('monthlyReportData:', monthlyReportData);
				console.log(
					'monthlyUnpaidBalance:',
					monthlyUnpaidBalance.toString(),
				);
			}

			if (reportLoaded) {
				duckdbLoaded.current = true;
			}
		}
	}, [myDuckDB, reportData]);

	useMemo(async () => {
		if (!duckdbLoaded) return;
		if (myDuckDB) {
			const getColumns = await myDuckDB.c.query(
				'SELECT "transaction-type" from report;',
			);
			console.log('Columns:', getColumns);
		}
	}, [duckdbLoaded]);

	const [period, setPeriod] = useState<Period>('monthly');
	const [date, setDate] = useState<{ start: Date; end: Date }>({
		start: new Date(),
		end: new Date(),
	});
	const [withTax, setWithTax] = useState(true);

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
					value={date}
					onMonthRangeSelect={setDate}
				/>
			</div>

			<TableComponent>
				<TableBody>
					<HeadTableRow>
						<TableCell>PL</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='pl_date' underLine={true}>
						<IndentTableCell />
						<TableCell>2024</TableCell>
					</PlbsTableRow>
					{(withTax ? plTableWithTax : plTableWithoutTax).map(
						item => (
							<PlbsTableRow
								key={item.key}
								underLine={item.underLine}
								doubleUnderLine={item.doubleUnderLine}
							>
								<IndentTableCell indent={item.indent}>
									{item.head}
								</IndentTableCell>
								<TableCell>100</TableCell>
							</PlbsTableRow>
						),
					)}
				</TableBody>
			</TableComponent>
			{withTax && (
				<TableComponent>
					<TableBody>
						<HeadTableRow>
							<TableCell>指標</TableCell>
						</HeadTableRow>
						<PlbsTableRow key='index_date' underLine={true}>
							<IndentTableCell />
							<TableCell>2024</TableCell>
						</PlbsTableRow>
						{indexTable.map(item => (
							<PlbsTableRow
								key={item.key}
								underLine={item.underLine}
								doubleUnderLine={item.doubleUnderLine}
							>
								<IndentTableCell indent={item.indent}>
									{item.head}
								</IndentTableCell>
								<TableCell>100</TableCell>
							</PlbsTableRow>
						))}
					</TableBody>
				</TableComponent>
			)}

			<TableComponent>
				<TableBody>
					<HeadTableRow>
						<TableCell>BS</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='bs_date' underLine={true}>
						<IndentTableCell />
						<TableCell>2024</TableCell>
					</PlbsTableRow>
					{(withTax ? bsTableWithTax : bsTableWithoutTax).map(
						item => (
							<PlbsTableRow
								key={item.key}
								underLine={item.underLine}
								doubleUnderLine={item.doubleUnderLine}
							>
								<IndentTableCell indent={item.indent}>
									{item.head}
								</IndentTableCell>
								<TableCell>100</TableCell>
							</PlbsTableRow>
						),
					)}
				</TableBody>
			</TableComponent>
		</div>
	);
}
