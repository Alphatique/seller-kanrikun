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

import useSWR from 'swr';
import { createSalesTrafficReportTable, initDuckDB } from '~/lib/duckdb';
import { fetchGunzipStrApi } from '~/lib/fetch-gunzip';
import tmpData from './tmp-data';

export function SessionCvrTableFilter() {
	const { data: reportData } = useSWR(
		'/api/reports/sales-traffic',
		fetchGunzipStrApi,
	);
	const { data: myDuckDB } = useSWR('/initDuckDB', initDuckDB);

	useEffect(() => {
		if (myDuckDB && reportData) {
			createSalesTrafficReportTable(myDuckDB, reportData);
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
			dateRange?.from && dateRange?.to
				? tmpData.filter(({ item_id, data }) => {
						const dataDate = new Date(data.date);

						if (
							dateRange.from! <= dataDate &&
							dataDate <= dateRange.to! &&
							selects.includes(item_id)
						) {
							return true;
						}
					})
				: [],
		[dateRange, selects],
	);

	const chartData: ChartDataBase[] = [];

	for (const { item_id, data } of filteredTableData) {
		const { date, sales } = data;
		// 既存の日付行を取得
		const row = chartData.find(item => item.date === date);
		// なければ新規追加
		if (!row) {
			chartData.push({ date, [item_id]: sales });
		} else {
			// ある場合は既存の行にitem_idをキー、salesを値として追加
			row[item_id] = sales;
		}
	}

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
		const downloadData = filteredTableData.map(
			({ item_id, item_name, data }) => {
				return {
					商品名: item_name,
					日付: data.date,
					売上: data.sales,
					売上個数: data.number_of_units_sold,
					平均単価: data.average_unit_price,
					アクセス数: data.number_of_accesses,
					CVRユニットセッション: data.cvr_unit_session,
					CVRユニットページビュー: data.cvr_unit_page_view,
					ROAS: data.roas,
					ACOS: data.acos,
				};
			},
		);
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
			selectSessionCvrProp === 'number_of_units_sold' ? (
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
					{filteredTableData.map(
						({ item_id, item_name, data }, index) => {
							return (
								<TableRow
									key={`${item_id}-${index.toString()}`}
								>
									<TableCell>{item_name}</TableCell>
									<TableCell>{data.date}</TableCell>
									<TableCell>{data.sales}</TableCell>
									<TableCell>
										{data.number_of_units_sold}
									</TableCell>
									<TableCell>
										{data.average_unit_price}
									</TableCell>
									<TableCell>
										{data.number_of_accesses}
									</TableCell>
									<TableCell>
										{data.cvr_unit_session}
									</TableCell>
									<TableCell>
										{data.cvr_unit_page_view}
									</TableCell>
									<TableCell>{data.roas}</TableCell>
									<TableCell>{data.acos}</TableCell>
								</TableRow>
							);
						},
					)}
				</TableBody>
			</Table>
		</div>
	);
}
