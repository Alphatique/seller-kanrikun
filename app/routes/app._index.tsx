import { format } from 'date-fns';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Label } from '~/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover';
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
import { cn } from '~/lib/utils';

enum Period {
	Monthly = 'Monthly',
	Quarterly = 'Quarterly',
	Yearly = 'Yearly',
}

import { CalendarIcon } from 'lucide-react';
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
					<Popover>
						<PopoverTrigger asChild>
							<Button
								id='date'
								variant={'outline'}
								className={cn(
									'w-[300px] justify-start text-left font-normal',
									!date && 'text-muted-foreground',
								)}
							>
								<CalendarIcon />
								{date?.from ? (
									date.to ? (
										<>
											{format(date.from, 'LLL dd, y')} -{' '}
											{format(date.to, 'LLL dd, y')}
										</>
									) : (
										format(date.from, 'LLL dd, y')
									)
								) : (
									<span>Pick a date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-aut p-0' align='start'>
							<Calendar
								mode='range'
								defaultMonth={date?.from}
								selected={date}
								onSelect={setDate}
								numberOfMonths={1}
							/>
						</PopoverContent>
					</Popover>
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
