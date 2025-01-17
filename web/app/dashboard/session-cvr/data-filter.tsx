'use client';

import {
	format,
	isAfter,
	isBefore,
	previousDay,
	startOfDay,
	startOfMonth,
	startOfQuarter,
	startOfWeek,
	startOfYear,
	subDays,
	subMonths,
	subQuarters,
	subWeeks,
	subYears,
} from 'date-fns';
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

import { DatePickerWithRange } from '~/components/date-range';

import { calcSessionCvrSql } from '@seller-kanrikun/data-operation/sql';
import useSWR from 'swr';
import {
	createInventoryTable,
	createSalesTrafficReportTable,
	initDuckDB,
} from '~/lib/duckdb';
import { fetchGunzipStrApi } from '~/lib/fetch-gunzip';

import { Chart } from './chart';
import { SessionTable } from './table';

export function formatValue(input: number) {
	return Number.isFinite(Number(input)) ? Number(input) : 0;
}

export function SessionCvrTableFilter() {
	const { data: reportData } = useSWR(
		'/api/reports/sales-traffic',
		fetchGunzipStrApi,
	);
	const { data: inventoryData } = useSWR('/api/inventory', fetchGunzipStrApi);
	const { data: myDuckDB } = useSWR('/initDuckDB', initDuckDB);

	const [sessionCvrData, setSessionCvrData] = useState<
		SessionCvrData[] | undefined
	>();

	const [selectsItems, setSelects] = useState<string[]>([]);
	const [selectData, setSelectData] = useState<keyof SessionCvrData>('sales');
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: subMonths(new Date(), 4),
		to: new Date(),
	});
	const [period, setPeriod] = useState<Period>('daily');

	useEffect(() => {
		if (myDuckDB && reportData && inventoryData) {
			(async () => {
				// データからdbのテーブルの作成
				await createSalesTrafficReportTable(myDuckDB, reportData);
				await createInventoryTable(myDuckDB, inventoryData);
				// sqlの実行
				const chartData = await myDuckDB.c.query(calcSessionCvrSql);

				// データのjs array化
				const formatData: SessionCvrData[] = [];
				for (let i = 0; i < chartData.numRows; i++) {
					const record = chartData.get(i);
					const json = record?.toJSON();

					// TODO: zodでやりたい
					const data: SessionCvrData = {
						asin: json?.asin,
						name: json?.name,
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
				results[data.asin] = data.name ? data.name : data.asin;
			}
		}
		// 全部の商品を選択状態にする
		setSelects(Object.keys(results));
		return results;
	}, [sessionCvrData]);

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
		name: '商品名',
		asin: 'ASIN',
		sales: '売上',
		units: '売上個数',
		averagePrice: '平均単価',
		pageViews: 'ページビュー',
		sessionCvr: 'CVRセッション',
		pageViewCvr: 'CVRページビュー',
		roas: 'ROAS',
		acos: 'ACOS',
	};

	return (
		<div className='grid gap-3'>
			<div className='flex gap-2'>
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
						<SelectItem value='daily'>日</SelectItem>
						<SelectItem value='weekly'>週</SelectItem>
						<SelectItem value='monthly'>月</SelectItem>
						<SelectItem value='quarterly'>四半期</SelectItem>
					</SelectContent>
				</Select>
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
							if (
								key === 'asin' ||
								key === 'date' ||
								key === 'name'
							)
								return;
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
			<Chart
				period={period}
				items={items}
				selectsItems={selectsItems}
				selectData={selectData}
				dateRange={dateRange}
				sessionCvrData={sessionCvrData}
			/>
			<SessionTable
				period={period}
				selectsItems={selectsItems}
				selectData={selectData}
				dateRange={dateRange}
				sessionCvrData={sessionCvrData}
			/>
		</div>
	);
}
