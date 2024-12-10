'use client';
import MultiSelect from '@seller-kanrikun/ui/components/multi-select';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';
import { Separator } from '@seller-kanrikun/ui/components/separator';
import BarChart from '~/components/bar-chart';
import { DatePickerWithRange } from '~/components/date-range';
import LineChart from '~/components/line-chart';
/*
export const metadata: Metadata = {
	title: 'セッション/CVR | セラー管理君',
};*/

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import { Button } from '@seller-kanrikun/ui/components/button';
import type { ChartConfig } from '@seller-kanrikun/ui/components/chart';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

const baseData: { item_id: string; item_name: string; data: SessionCvrData }[] =
	[
		{
			item_id: 'black',
			item_name: 'トイレタリーバッグ ブラック',
			data: {
				date: '2024-12-01',
				sales: 1000,
				number_of_units_sold: 10,
				average_unit_price: 100,
				number_of_accesses: 100,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'black',
			item_name: 'トイレタリーバッグ ブラック',
			data: {
				date: '2024-12-02',
				sales: 2000,
				number_of_units_sold: 20,
				average_unit_price: 100,
				number_of_accesses: 200,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'black',
			item_name: 'トイレタリーバッグ ブラック',
			data: {
				date: '2024-12-03',
				sales: 3000,
				number_of_units_sold: 30,
				average_unit_price: 100,
				number_of_accesses: 300,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'black',
			item_name: 'トイレタリーバッグ ブラック',
			data: {
				date: '2024-12-04',
				sales: 4000,
				number_of_units_sold: 40,
				average_unit_price: 100,
				number_of_accesses: 400,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'black',
			item_name: 'トイレタリーバッグ ブラック',
			data: {
				date: '2024-12-05',
				sales: 5000,
				number_of_units_sold: 50,
				average_unit_price: 100,
				number_of_accesses: 500,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'black',
			item_name: 'トイレタリーバッグ ブラック',
			data: {
				date: '2024-12-06',
				sales: 6000,
				number_of_units_sold: 60,
				average_unit_price: 100,
				number_of_accesses: 600,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'black',
			item_name: 'トイレタリーバッグ ブラック',
			data: {
				date: '2024-12-07',
				sales: 7000,
				number_of_units_sold: 70,
				average_unit_price: 100,
				number_of_accesses: 700,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-01',
				sales: 1100,
				number_of_units_sold: 11,
				average_unit_price: 100,
				number_of_accesses: 110,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-02',
				sales: 2100,
				number_of_units_sold: 21,
				average_unit_price: 100,
				number_of_accesses: 210,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-03',
				sales: 3100,
				number_of_units_sold: 31,
				average_unit_price: 100,
				number_of_accesses: 310,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-04',
				sales: 4100,
				number_of_units_sold: 41,
				average_unit_price: 100,
				number_of_accesses: 410,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-05',
				sales: 5100,
				number_of_units_sold: 51,
				average_unit_price: 100,
				number_of_accesses: 510,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-06',
				sales: 6100,
				number_of_units_sold: 61,
				average_unit_price: 100,
				number_of_accesses: 610,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-07',
				sales: 7100,
				number_of_units_sold: 71,
				average_unit_price: 100,
				number_of_accesses: 710,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.1,
				roas: 1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-01',
				sales: 1200,
				number_of_units_sold: 12,
				average_unit_price: 100,
				number_of_accesses: 120,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.11,
				roas: 1.2,
				acos: 0.08,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-02',
				sales: 2300,
				number_of_units_sold: 23,
				average_unit_price: 100,
				number_of_accesses: 220,
				cvr_unit_session: 0.105,
				cvr_unit_page_view: 0.11,
				roas: 1.15,
				acos: 0.09,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-03',
				sales: 3400,
				number_of_units_sold: 34,
				average_unit_price: 100,
				number_of_accesses: 310,
				cvr_unit_session: 0.11,
				cvr_unit_page_view: 0.12,
				roas: 1.1,
				acos: 0.1,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-04',
				sales: 4600,
				number_of_units_sold: 46,
				average_unit_price: 100,
				number_of_accesses: 400,
				cvr_unit_session: 0.115,
				cvr_unit_page_view: 0.12,
				roas: 1.05,
				acos: 0.11,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-05',
				sales: 5800,
				number_of_units_sold: 58,
				average_unit_price: 100,
				number_of_accesses: 510,
				cvr_unit_session: 0.12,
				cvr_unit_page_view: 0.13,
				roas: 1.0,
				acos: 0.12,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-06',
				sales: 7000,
				number_of_units_sold: 70,
				average_unit_price: 100,
				number_of_accesses: 620,
				cvr_unit_session: 0.125,
				cvr_unit_page_view: 0.13,
				roas: 0.95,
				acos: 0.13,
			},
		},
		{
			item_id: 'navy',
			item_name: 'トイレタリーバッグ ネイビー',
			data: {
				date: '2024-12-07',
				sales: 8200,
				number_of_units_sold: 82,
				average_unit_price: 100,
				number_of_accesses: 730,
				cvr_unit_session: 0.13,
				cvr_unit_page_view: 0.14,
				roas: 0.9,
				acos: 0.14,
			},
		},
		{
			item_id: 'olive',
			item_name: 'トイレタリーバッグ オリーブ',
			data: {
				date: '2024-12-01',
				sales: 1100,
				number_of_units_sold: 11,
				average_unit_price: 100,
				number_of_accesses: 110,
				cvr_unit_session: 0.095,
				cvr_unit_page_view: 0.1,
				roas: 1.1,
				acos: 0.09,
			},
		},
		{
			item_id: 'olive',
			item_name: 'トイレタリーバッグ オリーブ',
			data: {
				date: '2024-12-02',
				sales: 2100,
				number_of_units_sold: 21,
				average_unit_price: 100,
				number_of_accesses: 200,
				cvr_unit_session: 0.1,
				cvr_unit_page_view: 0.105,
				roas: 1.05,
				acos: 0.1,
			},
		},
		{
			item_id: 'olive',
			item_name: 'トイレタリーバッグ オリーブ',
			data: {
				date: '2024-12-03',
				sales: 3200,
				number_of_units_sold: 32,
				average_unit_price: 100,
				number_of_accesses: 290,
				cvr_unit_session: 0.105,
				cvr_unit_page_view: 0.11,
				roas: 1.0,
				acos: 0.11,
			},
		},
		{
			item_id: 'olive',
			item_name: 'トイレタリーバッグ オリーブ',
			data: {
				date: '2024-12-04',
				sales: 4300,
				number_of_units_sold: 43,
				average_unit_price: 100,
				number_of_accesses: 390,
				cvr_unit_session: 0.11,
				cvr_unit_page_view: 0.12,
				roas: 0.95,
				acos: 0.12,
			},
		},
		{
			item_id: 'olive',
			item_name: 'トイレタリーバッグ オリーブ',
			data: {
				date: '2024-12-05',
				sales: 5500,
				number_of_units_sold: 55,
				average_unit_price: 100,
				number_of_accesses: 500,
				cvr_unit_session: 0.115,
				cvr_unit_page_view: 0.125,
				roas: 0.9,
				acos: 0.13,
			},
		},
		{
			item_id: 'olive',
			item_name: 'トイレタリーバッグ オリーブ',
			data: {
				date: '2024-12-06',
				sales: 6700,
				number_of_units_sold: 67,
				average_unit_price: 100,
				number_of_accesses: 610,
				cvr_unit_session: 0.12,
				cvr_unit_page_view: 0.13,
				roas: 0.85,
				acos: 0.14,
			},
		},
		{
			item_id: 'olive',
			item_name: 'トイレタリーバッグ オリーブ',
			data: {
				date: '2024-12-07',
				sales: 7900,
				number_of_units_sold: 79,
				average_unit_price: 100,
				number_of_accesses: 720,
				cvr_unit_session: 0.125,
				cvr_unit_page_view: 0.14,
				roas: 0.8,
				acos: 0.15,
			},
		},
	];
/*
const chartConfig = {
	desktop: {
		label: 'Desktop',
		color: 'hsl(var(--chart-1))',
	},
	mobile: {
		label: 'Mobile',
		color: 'hsl(var(--chart-2))',
	},
} satisfies ChartConfig;
*/

export default function Page() {
	const [selectSessionCvrProp, setSelectSessionCvrProp] =
		useState<keyof SessionCvrData>('sales');
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	const [sessionCvrData, setSessionCvrData] = useState<
		SessionCvrData[] | undefined
	>();
	let chartData: ChartDataBase[] = [];
	const [selects, setSelects] = useState<string[]>([]);

	function transformData() {
		const dateMap: ChartDataBase[] = [];
		if (dateRange === undefined) return;
		if (dateRange.from === undefined || dateRange.to === undefined) return;

		for (const { item_id, data } of baseData) {
			if (!selects.includes(item_id)) continue;
			const dataDate = new Date(data.date);
			if (dateRange.from > dataDate || dateRange.to < dataDate) continue;

			const { date, sales } = data;
			// 既存の日付行を取得
			const row = dateMap.find(item => item.date === date);
			// なければ新規追加
			if (!row) {
				dateMap.push({ date, [item_id]: sales });
			} else {
				// ある場合は既存の行にitem_idをキー、salesを値として追加
				row[item_id] = sales;
			}
		}

		chartData = dateMap;
	}
	transformData();

	const goods: Record<string, string> = {
		black: 'トイレタリーバッグ ブラック',
		navy: 'トイレタリーバッグ ネイビー',
		olive: 'トイレタリーバッグ オリーブ',
	};

	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>セッション/CVR</h1>
			<Separator />
			<div className='flex gap-3'>
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
						<SelectItem value='number_of_units_sold'>売上個数</SelectItem>
						<SelectItem value='average_unit_price'>平均単価</SelectItem>
						<SelectItem value='number_of_accesses'>アクセス数</SelectItem>
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
				<DatePickerWithRange value={dateRange} onValueChange={setDateRange} />
				<Button>Download</Button>
			</div>
			{selectSessionCvrProp === 'sales' ||
			selectSessionCvrProp === 'number_of_units_sold' ? (
				<BarChart
					data={chartData}
					config={Object.entries(goods).reduce((acc, [key, label], i) => {
						acc[key] = { label, color: `hsl(var(--chart-${i + 1}))` };
						return acc;
					}, {} as ChartConfig)}
				/>
			) : (
				<LineChart
					data={chartData}
					config={Object.entries(goods).reduce((acc, [key, label], i) => {
						acc[key] = { label, color: `hsl(var(--chart-${i + 1}))` };
						return acc;
					}, {} as ChartConfig)}
				/>
			)}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>商品名</TableHead>
						<TableHead>日付</TableHead>
						<TableHead>売上</TableHead>
						<TableHead>売上個数</TableHead>
						<TableHead>平均単価</TableHead>
						<TableHead>アクセス数</TableHead>
						<TableHead>CVRユニットセッション</TableHead>
						<TableHead>CVRユニットページビュー</TableHead>
						<TableHead>ROAS</TableHead>
						<TableHead>ACOS</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{dateRange !== undefined &&
						dateRange.from !== undefined &&
						dateRange.to !== undefined &&
						baseData.map(({ item_id, item_name, data }, index) => {
							const dataDate = new Date(data.date);
							if (!selects.includes(item_id)) return null;
							if (dateRange.from! > dataDate || dateRange.to! < dataDate)
								return null;
							return (
								<TableRow key={`${item_id}-${index.toString()}`}>
									<TableCell>{item_name}</TableCell>
									<TableCell>{data.date}</TableCell>
									<TableCell>{data.sales}</TableCell>
									<TableCell>{data.number_of_units_sold}</TableCell>
									<TableCell>{data.average_unit_price}</TableCell>
									<TableCell>{data.number_of_accesses}</TableCell>
									<TableCell>{data.cvr_unit_session}</TableCell>
									<TableCell>{data.cvr_unit_page_view}</TableCell>
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
