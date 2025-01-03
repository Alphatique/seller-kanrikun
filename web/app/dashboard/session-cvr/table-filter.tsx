'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@seller-kanrikun/ui/components/button';
import type { ChartConfig } from '@seller-kanrikun/ui/components/chart';
import { MultiSelect } from '@seller-kanrikun/ui/components/multi-select';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import { BarChart } from '~/components/bar-chart';
import { DatePickerWithRange } from '~/components/date-range';
import { LineChart } from '~/components/line-chart';
import { downloadCsv } from '~/lib/file-downloads';

import { calcSalesTrafficReport } from '@seller-kanrikun/data-operation/sql';
import useSWR from 'swr';
import { createSalesTrafficReportTable, initDuckDB } from '~/lib/duckdb';
import { fetchGunzipStrApi } from '~/lib/fetch-gunzip';

export function SessionCvrTableFilter() {
	const { data: reportData } = useSWR(
		'/api/reports/sales-traffic',
		fetchGunzipStrApi,
	);
	const { data: myDuckDB } = useSWR('/initDuckDB', initDuckDB);

	useEffect(() => {
		if (myDuckDB && reportData) {
			(async () => {
				await createSalesTrafficReportTable(myDuckDB, reportData);
				const filteredData = await myDuckDB.c.query(
					calcSalesTrafficReport,
				);
				console.log(filteredData);
				const formatedData: SessionCvrData[] = [];
				for (let i = 0; i < filteredData.numRows; i++) {
					const record = filteredData.get(i);
					const json = record?.toJSON();

					const data: SessionCvrData = {
						asin: json?.asin,
						averagePrice: Number(json?.averagePrice),
						date: new Date(json?.date),
						pageViewCvr: Number(json?.pageViewCvr),
						pageViews: Number(json?.pageViews),
						sales: Number(json?.sales),
						sessionCvr: Number(json?.sessionCvr),
						units: Number(json?.units),
						roas: Number.NaN,
						acos: Number.NaN,
					};
					formatedData.push(data);

					setSessionCvrData(formatedData);
				}
			})();
		}
	}, [myDuckDB, reportData]);

	const [selectSessionCvrProp, setSelectSessionCvrProp] =
		useState<keyof SessionCvrData>('sales');
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	const [sessionCvrData, setSessionCvrData] = useState<
		SessionCvrData[] | undefined
	>();
	const [selects, setSelects] = useState<string[]>([]);

	const filteredTableData = useMemo(
		() =>
			dateRange?.from && dateRange?.to && sessionCvrData
				? sessionCvrData.filter(data => {
						if (
							dateRange.from! <= data.date &&
							data.date <= dateRange.to! &&
							selects.includes(data.asin)
						) {
							return true;
						}
					})
				: [],
		[dateRange, selects],
	);

	const chartData: ChartDataBase[] = useMemo(() => {
		return filteredTableData.map(data => {
			return {
				date: data.date,
				[selectSessionCvrProp]: data[selectSessionCvrProp],
			} as ChartDataBase;
		});
	}, []);

	const headers: string[] = [
		'商品名',
		'日付',
		'売上',
		'売上個数',
		'平均単価',
		'アクセス数',
		'CVRユニットセッション',
		'CVRユニットページビュー',
		'ROAS',
		'ACOS',
	];

	const handleDownload = () => {
		const downloadData = filteredTableData.map(data => {
			return {
				商品名: data.asin,
				日付: data.date,
				売上: data.sales,
				売上個数: data.units,
				平均単価: data.averagePrice,
				アクセス数: data.pageViews,
				CVRユニットセッション: data.sessionCvr,
				CVRユニットページビュー: data.pageViewCvr,
				ROAS: data.roas,
				ACOS: data.acos,
			};
		});
		downloadCsv(downloadData, headers, 'session-cvr.csv');
	};

	const goods: Record<string, string> = {
		black: 'トイレタリーバッグ ブラック',
		navy: 'トイレタリーバッグ ネイビー',
		olive: 'トイレタリーバッグ オリーブ',
	};

	return (
		<div className='grid gap-3'>
			<div className='flex gap-2'>
				<MultiSelect
					values={goods}
					selects={selects}
					onSelectChange={setSelects}
				/>
				<Select
					value={selectSessionCvrProp}
					onValueChange={(value: keyof SessionCvrData) => {
						setSelectSessionCvrProp(value);
					}}
				>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='period' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='sales'>売上</SelectItem>
						<SelectItem value='number_of_units_sold'>
							売上個数
						</SelectItem>
						<SelectItem value='average_unit_price'>
							平均単価
						</SelectItem>
						<SelectItem value='number_of_accesses'>
							アクセス数
						</SelectItem>
						<SelectItem value='cvr_unit_session'>
							CVRユニットセッション
						</SelectItem>
						<SelectItem value='cvr_unit_page_view'>
							CVRユニットページビュー
						</SelectItem>
						<SelectItem value='roas'>ROAS</SelectItem>
						<SelectItem value='acos'>ACOS</SelectItem>
					</SelectContent>
				</Select>
				<DatePickerWithRange
					value={dateRange}
					onValueChange={setDateRange}
				/>
				<Button onClick={handleDownload}>Download</Button>
			</div>
			{selectSessionCvrProp === 'sales' ||
			selectSessionCvrProp === 'units' ? (
				<BarChart
					data={chartData}
					config={Object.entries(goods).reduce(
						(acc, [key, label], i) => {
							acc[key] = {
								label,
								color: `hsl(var(--chart-${i + 1}))`,
							};
							return acc;
						},
						{} as ChartConfig,
					)}
				/>
			) : (
				<LineChart
					data={chartData}
					config={Object.entries(goods).reduce(
						(acc, [key, label], i) => {
							acc[key] = {
								label,
								color: `hsl(var(--chart-${i + 1}))`,
							};
							return acc;
						},
						{} as ChartConfig,
					)}
				/>
			)}
			<Table>
				<TableHeader>
					<TableRow>
						{headers.map((header, index) => {
							return (
								<TableCell
									key={`${header}-${index.toString()}`}
								>
									{header}
								</TableCell>
							);
						})}
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredTableData.map((data, index) => {
						return (
							<TableRow key={`${data.asin}-${index.toString()}`}>
								<TableCell>{data.asin}</TableCell>
								<TableCell>{data.date.toISOString()}</TableCell>
								<TableCell>{data.sales}</TableCell>
								<TableCell>{data.units}</TableCell>
								<TableCell>{data.averagePrice}</TableCell>
								<TableCell>{data.pageViews}</TableCell>
								<TableCell>{data.sessionCvr}</TableCell>
								<TableCell>{data.pageViewCvr}</TableCell>
								<TableCell>{data.roas}</TableCell>
								<TableCell>{data.acos}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
