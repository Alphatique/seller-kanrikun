import { Button } from '@seller-kanrikun/ui/components/button';
import {
	type MonthRangeCalProps,
	MonthRangePicker,
} from '@seller-kanrikun/ui/components/month-range-picker';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@seller-kanrikun/ui/components/popover';
import { cn } from '@seller-kanrikun/ui/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface MonthPickerWithRangeProps {
	value: { start: Date; end: Date };
}

export default function PopoverMonthRangePicker({
	value,
	onMonthRangeSelect,
	onStartMonthSelect,
	callbacks,
	selectedMonthRange,
	onYearBackward,
	onYearForward,
	variant,
	minDate,
	maxDate,
	quickSelectors,
	showQuickSelectors,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> &
	MonthRangeCalProps &
	MonthPickerWithRangeProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-[280px] justify-start text-left font-normal',
						!value && 'text-muted-foreground',
					)}
				>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{value ? (
						`${format(value.start, 'MMM yyyy')} - ${format(value.end, 'MMM yyyy')}`
					) : (
						<span>Pick a month range</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0'>
				<MonthRangePicker
					onMonthRangeSelect={({ start, end }) => {
						value = { start, end };
						onMonthRangeSelect?.({ start, end });
					}}
					onStartMonthSelect={onStartMonthSelect}
					callbacks={callbacks}
					selectedMonthRange={selectedMonthRange}
					onYearBackward={onYearBackward}
					onYearForward={onYearForward}
					variant={variant}
					minDate={minDate}
					maxDate={maxDate}
					quickSelectors={quickSelectors}
					showQuickSelectors={showQuickSelectors}
					className={className}
					{...props}
				/>
			</PopoverContent>
		</Popover>
	);
}
