import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import {
	Button,
	DateRangeInput,
	DateTableRow,
	HeadTableRow,
	IndentableTableCell,
	Label,
	PLBSTableRow,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
} from '@seller-kanrikun/ui';

import type { Period } from '~/types';

export default function HomePage() {
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	const [period, setPeriod] = useState<Period>('monthly');

	return (
		<div className='grid gap-4'>
			<Label>Welcome to the Home Page!</Label>
			<div className='flex items-center justify-between'>
				<Select
					value={period}
					onValueChange={period => setPeriod(period as Period)}
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
				<div className='flex items-center gap-2'>
					<DateRangeInput value={date} onValueChange={setDate} />
					<Button>Submit</Button>
					<Button>Download</Button>
				</div>
			</div>

			<Table>
				<TableBody>
					<HeadTableRow>
						<IndentableTableCell>PL</IndentableTableCell>
					</HeadTableRow>
					<DateTableRow>
						<IndentableTableCell />
						<TableCell>2024/02</TableCell>
						<TableCell>2024/03</TableCell>
					</DateTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>売上</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>商品代金</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>配送料</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
				</TableBody>
			</Table>
		</div>
	);
}
