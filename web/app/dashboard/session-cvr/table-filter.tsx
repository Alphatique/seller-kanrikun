'use client';

import { isAfter, isBefore } from 'date-fns';
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

	const [sessionCvrData, setSessionCvrData] = useState<
		SessionCvrData[] | undefined
	>();

	const [selectsItems, setSelects] = useState<string[]>([]);
	const [selectData, setSelectData] = useState<keyof SessionCvrData>('sales');
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});

	useEffect(() => {
		if (myDuckDB && reportData) {
			(async () => {
				// データからdbのテーブルの作成
				await createSalesTrafficReportTable(myDuckDB, reportData);
				// sqlの実行
				const filteredData = await myDuckDB.c.query(
					calcSalesTrafficReport,
				);
				// データのjs array化
				const formatData: SessionCvrData[] = [];
				for (let i = 0; i < filteredData.numRows; i++) {
					const record = filteredData.get(i);
					const json = record?.toJSON();

					// TODO: zodでやりたい
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
					formatData.push(data);
				}
				setSessionCvrData(formatData);
			})();
		}
	}, [myDuckDB, reportData]);

	// sessionCvrから使うデータを作成
	const items: Record<string, string> = useMemo(() => {
		if (!sessionCvrData) return {};
		const results: Record<string, string> = {};
		for (const data of sessionCvrData) {
			if (!results[data.asin]) {
				results[data.asin] = 'name';
			}
		}
		return results;
	}, [sessionCvrData]);

	const chartData = useMemo(() => {
		if (!(sessionCvrData && dateRange?.from && dateRange?.to)) return [];
		if (selectData === 'date') return [];
		type itemKeys = (typeof items)[number] | 'date';
		const dateResult: Record<
			string,
			Record<itemKeys, number | string>
		> = {};
		for (const data of sessionCvrData) {
			if (!selectsItems.includes(data.asin)) continue;
			if (
				isAfter(data.date, dateRange.from) &&
				isBefore(data.date, dateRange.to)
			) {
				const dateStr = data.date.toString();
				if (!dateResult[dateStr]) {
					dateResult[dateStr] = { date: dateStr };
				}
				console.log(data, selectData, data[selectData]);
				dateResult[dateStr][data.asin] = data[selectData];
			}
		}

		const result = [];
		for (const data of Object.values(dateResult)) {
			result.push(data);
		}

		return result;
	}, [sessionCvrData, selectData, selectsItems, dateRange]);

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
		/*
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
		downloadCsv(downloadData, headers, 'session-cvr.csv');*/
	};

	const dataHeader: Record<keyof SessionCvrData, string> = {
		date: '日付',
		asin: 'ASIN',
		sales: '売上',
		units: '売上個数',
		averagePrice: '平均単価',
		pageViews: 'ページビュー',
		sessionCvr: 'CVRユニットセッション',
		pageViewCvr: 'CVRユニットページビュー',
		roas: 'ROAS',
		acos: 'ACOS',
	};

	return (
		<div className='grid gap-3'>
			<div className='flex gap-2'>
				<MultiSelect
					values={items}
					selects={selectsItems}
					onSelectChange={setSelects}
				/>
				<Select
					value={selectData}
					onValueChange={(value: keyof SessionCvrData) => {
						setSelectData(value);
					}}
				>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='period' />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(dataHeader).map(([key, value]) => {
							if (key === 'asin' || key === 'date') return;
							return (
								<SelectItem value={key} key={key}>
									{value}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
				<DatePickerWithRange
					value={dateRange}
					onValueChange={setDateRange}
				/>
				<Button onClick={handleDownload}>Download</Button>
			</div>
			{selectData === 'sales' || selectData === 'units' ? (
				<BarChart
					data={chartData}
					config={Object.entries(items).reduce(
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
					config={Object.entries(items).reduce(
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
			{/*
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
			*/}
		</div>
	);
}
