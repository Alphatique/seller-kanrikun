import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DateRangeInputProps extends React.HTMLAttributes<HTMLElement> {
	value: DateRange | undefined;
	onValueChange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DateRangeInput({
	value,
	onValueChange,
	className,
	...props
}: DateRangeInputProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					className={cn(
						'w-[260px] justify-start text-left font-normal',
						!value && 'text-muted-foreground',
						className,
					)}
					{...props}
				>
					<CalendarIcon />
					{value?.from ? (
						value.to ? (
							<>
								{format(value.from, 'LLL dd, y')} -{' '}
								{format(value.to, 'LLL dd, y')}
							</>
						) : (
							format(value.from, 'LLL dd, y')
						)
					) : (
						<span>Pick a date</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0' align='start'>
				<Calendar
					mode='range'
					defaultMonth={value?.from}
					selected={value}
					onSelect={onValueChange}
					numberOfMonths={1}
				/>
			</PopoverContent>
		</Popover>
	);
}
