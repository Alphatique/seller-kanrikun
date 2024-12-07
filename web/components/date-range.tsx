'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@seller-kanrikun/ui/components/button';
import { Calendar } from '@seller-kanrikun/ui/components/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@seller-kanrikun/ui/components/popover';
import { cn } from '@seller-kanrikun/ui/lib/utils';

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLElement> {
	value: DateRange | undefined;
	onValueChange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export default function DatePickerWithRange({
	className,
	value,
	onValueChange,
}: DatePickerWithRangeProps) {
	return (
		<div className={cn('grid gap-2', className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant={'outline'}
						className={cn(
							'w-[300px] justify-start text-left font-normal',
							!value && 'text-muted-foreground',
						)}
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
						initialFocus
						mode='range'
						defaultMonth={value?.from}
						selected={value}
						onSelect={onValueChange}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
