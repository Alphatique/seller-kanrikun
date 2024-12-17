'use client';
import { useMemo, useRef, useState } from 'react';

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
	Table,
	TableBody,
	TableCell,
} from '@seller-kanrikun/ui/components/table';

import { PopoverMonthRangePicker } from '~/components/popover-month-range-picker';
import { initDuckDB } from '~/lib/duckdb';

import {
	bsTableWithTax,
	bsTableWithoutTax,
	indexTable,
	plTableWithTax,
	plTableWithoutTax,
} from './table-meta';
import { HeadTableRow, IndentTableCell, PlbsTableRow } from './table-pl-bs';

import { useSession } from '@seller-kanrikun/auth/client';
import useSWR from 'swr';
import { SWRLoadFile } from '~/lib/opfs';

export function PlbsTableFilter() {
	const { data: myDuckDB } = useSWR('initDB', initDuckDB);
	const { data: session } = useSession();
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

	const reportLoaded = useRef(false);

	useMemo(async () => {
		if (myDuckDB) {
			if (reportData && !reportLoaded.current) {
				reportLoaded.current = true;
				await myDuckDB.db.registerFileText('report.csv', reportData);
				// テーブル名を表示
				const crateTable = await myDuckDB.c.query(
					'CREATE TABLE report AS SELECT * FROM report.csv;',
				);

				const getColumns = await myDuckDB.c.query(
					`SELECT SUM("price-amount") AS total_price_amount FROM report WHERE "transaction-type" = 'Order' AND "price-type" = 'Principal';`,
				);

				console.log('Report data from DuckDB:', getColumns);
				console.log(
					'Columns:',
					getColumns.toArray()[0].total_price_amount,
				);
			}
		}
	}, [myDuckDB, reportData]);

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

			<Table>
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
			</Table>
			{withTax && (
				<Table>
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
				</Table>
			)}

			<Table>
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
			</Table>
		</div>
	);
}
