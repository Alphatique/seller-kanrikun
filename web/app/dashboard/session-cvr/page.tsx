'use client';
import BarChart from '@seller-kanrikun/ui/components/bar-chart';
import LineChart from '@seller-kanrikun/ui/components/line-chart';
import MultiSelect from '@seller-kanrikun/ui/components/multi-select';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';
import { Separator } from '@seller-kanrikun/ui/components/separator';
import { DatePickerWithRange } from '~/components/date-range';
/*
export const metadata: Metadata = {
	title: 'セッション/CVR | セラー管理君',
};*/

import {
	Table,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import { Button } from '@seller-kanrikun/ui/components/button';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

export default function Page() {
	const [cvrData, setCvrData] = useState<SessionCvrData>('sales');
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});

	const [selects, setSelects] = useState<string[]>([]);
	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>セッション/CVR</h1>
			<Separator />
			<div className='flex gap-3'>
				<MultiSelect
					values={{
						'0': 'トイレタリーバッグ ブラック',
						'1': 'トイレタリーバッグ ネイビー',
						'2': 'トイレタリーバッグ オリーブ',
					}}
					selects={selects}
					onSelectChange={setSelects}
				/>
				<Select
					value={cvrData}
					onValueChange={(value: SessionCvrData) => {
						setCvrData(value);
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
				<DatePickerWithRange value={date} onValueChange={setDate} />
				<Button>Download</Button>
			</div>
			<LineChart />
			<BarChart />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ASIN</TableHead>
						<TableHead>原価(円)</TableHead>
					</TableRow>
				</TableHeader>
			</Table>
		</div>
	);
}
