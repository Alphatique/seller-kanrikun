import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { DateRangeInput } from '~/components/date-range-input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table';

enum Period {
	Monthly = 'Monthly',
	Quarterly = 'Quarterly',
	Yearly = 'Yearly',
}

export default function HomePage() {
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});

	return (
		<div>
			<Label>Welcome to the Home Page!</Label>
			<div className='flex justify-between'>
				<Select value={Period.Monthly}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='period' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={Period.Monthly}>Monthly</SelectItem>
						<SelectItem value={Period.Quarterly}>Quarterly</SelectItem>
						<SelectItem value={Period.Yearly}>Yearly</SelectItem>
					</SelectContent>
				</Select>
				<div className='flex space-x-4'>
					<DateRangeInput date={date} setDate={setDate} />
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
				<TableBody>
					<TableRow>
						<TableCell>項目1</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>項目2</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
