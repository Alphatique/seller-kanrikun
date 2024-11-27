import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import {
	Button,
	DateRangeInput,
	Label,
	PlbsTable,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui';

import type { Period, PlbsRangedData } from '~/types';

import { useSession } from '@seller-kanrikun/auth/client';
import type { ReportDocumentRowJson } from '@seller-kanrikun/data-operation/types';

export default function HomePage() {
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	const [period, setPeriod] = useState<Period>('monthly');
	const [tableData, setTableData] = useState<PlbsRangedData[]>([]);

	const { data: session } = useSession();

	const tableLeftHeader = [{ title: 'PL', indent: 1 }, { title: 'BS' }];

	if (session) {
		fetch('/app/read-data', {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain', // Textデータの指定
			},
			body: session.user.id,
		})
			.then(async response => {
				const json: ReportDocumentRowJson[] = await response.json();
				console.log(json);
				console.log(json[1]['posted-date']);
				console.log(new Date(json[1]['posted-date']));
			})
			.catch(error => console.error('Error:', error));
	}

	const dateRange: Record<string, DateRange> = {};

	const onPeriodChangeHandler = (value: string) => {
		setPeriod(value as Period);
	};

	return (
		<div className='grid gap-4'>
			<Label>Welcome to the Home Page!</Label>
			<div className='flex items-center justify-between'>
				<Select value={period} onValueChange={onPeriodChangeHandler}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='period' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='monthly'>Monthly</SelectItem>
						<SelectItem value='quarterly'>Quarterly</SelectItem>
						<SelectItem value='yearly'>Yearly</SelectItem>
					</SelectContent>
				</Select>
				<div className='flex items-center gap-2'>
					<DateRangeInput value={date} onValueChange={setDate} />
					<Button>Submit</Button>
					<Button>Download</Button>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>項目</TableHead>
					</TableRow>
				</TableHeader>
			</Table>

			<PlbsTable
				title={'PL'}
				data={{ date: { leftHead: '', indent: 0, values: ['11'] } }}
			/>
			<PlbsTable title={'BS'} data={{}} />
		</div>
	);
}
