import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from './button';

const addMonths = (input: Date, months: number) => {
	const date = new Date(input);
	date.setDate(1);
	date.setMonth(date.getMonth() + months);
	date.setDate(
		Math.min(
			input.getDate(),
			getDaysInMonth(date.getFullYear(), date.getMonth() + 1),
		),
	);
	return date;
};
const getDaysInMonth = (year: number, month: number) =>
	new Date(year, month, 0).getDate();

type Month = {
	number: number;
	name: string;
	yearOffset: number;
};

const MONTHS: Month[][] = [
	[
		{ number: 0, name: '1月', yearOffset: -1 },
		{ number: 1, name: '2月', yearOffset: -1 },
		{ number: 2, name: '3月', yearOffset: -1 },
		{ number: 3, name: '4月', yearOffset: -1 },
		{ number: 0, name: '1月', yearOffset: 0 },
		{ number: 1, name: '2月', yearOffset: 0 },
		{ number: 2, name: '3月', yearOffset: 0 },
		{ number: 3, name: '4月', yearOffset: 0 },
	],
	[
		{ number: 4, name: '5月', yearOffset: -1 },
		{ number: 5, name: '6月', yearOffset: -1 },
		{ number: 6, name: '7月', yearOffset: -1 },
		{ number: 7, name: '8月', yearOffset: -1 },
		{ number: 4, name: '5月', yearOffset: 0 },
		{ number: 5, name: '6月', yearOffset: 0 },
		{ number: 6, name: '7月', yearOffset: 0 },
		{ number: 7, name: '8月', yearOffset: 0 },
	],
	[
		{ number: 8, name: '9月', yearOffset: -1 },
		{ number: 9, name: '10月', yearOffset: -1 },
		{ number: 10, name: '11月', yearOffset: -1 },
		{ number: 11, name: '12月', yearOffset: -1 },
		{ number: 8, name: '9月', yearOffset: 0 },
		{ number: 9, name: '10月', yearOffset: 0 },
		{ number: 10, name: '11月', yearOffset: 0 },
		{ number: 11, name: '12月', yearOffset: 0 },
	],
];

type QuickSelector = {
	label: string;
	startMonth: Date;
	endMonth: Date;
	variant?: ButtonVariant;
	onClick?: (selector: QuickSelector) => void;
};

const QUICK_SELECTORS: QuickSelector[] = [
	{
		label: '今年',
		startMonth: new Date(new Date().getFullYear(), 0),
		endMonth: new Date(new Date().getFullYear(), 11),
	},
	{
		label: '去年',
		startMonth: new Date(new Date().getFullYear() - 1, 0),
		endMonth: new Date(new Date().getFullYear() - 1, 11),
	},
	{
		label: '6ヶ月',
		startMonth: new Date(addMonths(new Date(), -6)),
		endMonth: new Date(),
	},
	{
		label: '12ヶ月',
		startMonth: new Date(addMonths(new Date(), -12)),
		endMonth: new Date(),
	},
];

type MonthRangeCalProps = {
	selectedMonthRange?: { start: Date; end: Date };
	onStartMonthSelect?: (date: Date) => void;
	onMonthRangeSelect?: ({ start, end }: { start: Date; end: Date }) => void;
	onYearForward?: () => void;
	onYearBackward?: () => void;
	callbacks?: {
		yearLabel?: (year: number) => string;
		monthLabel?: (month: Month) => string;
	};
	variant?: {
		calendar?: {
			main?: ButtonVariant;
			selected?: ButtonVariant;
		};
		chevrons?: ButtonVariant;
	};
	minDate?: Date;
	maxDate?: Date;
	quickSelectors?: QuickSelector[];
	showQuickSelectors?: boolean;
};

type ButtonVariant =
	| 'default'
	| 'outline'
	| 'ghost'
	| 'link'
	| 'destructive'
	| 'secondary'
	| null
	| undefined;

function MonthRangePicker({
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
}: React.HTMLAttributes<HTMLDivElement> & MonthRangeCalProps) {
	return (
		<div className={cn('min-w-[400px] p-3', className)} {...props}>
			<div className='flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0'>
				<div className='w-full'>
					<MonthRangeCal
						onMonthRangeSelect={onMonthRangeSelect}
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
					/>
				</div>
			</div>
		</div>
	);
}

function MonthRangeCal({
	selectedMonthRange,
	onMonthRangeSelect,
	onStartMonthSelect,
	callbacks,
	variant,
	minDate,
	maxDate,
	quickSelectors = QUICK_SELECTORS,
	showQuickSelectors = true,
	onYearBackward,
	onYearForward,
}: MonthRangeCalProps) {
	const [startYear, setStartYear] = React.useState<number>(
		selectedMonthRange?.start.getFullYear() ?? new Date().getFullYear(),
	);
	const [startMonth, setStartMonth] = React.useState<number>(
		selectedMonthRange?.start?.getMonth() ?? new Date().getMonth(),
	);
	const [endYear, setEndYear] = React.useState<number>(
		selectedMonthRange?.end?.getFullYear() ?? new Date().getFullYear() + 1,
	);
	const [endMonth, setEndMonth] = React.useState<number>(
		selectedMonthRange?.end?.getMonth() ?? new Date().getMonth(),
	);
	const [rangePending, setRangePending] = React.useState<boolean>(false);
	const [endLocked, setEndLocked] = React.useState<boolean>(true);
	const [menuYear, setMenuYear] = React.useState<number>(startYear);

	if (minDate && maxDate && minDate > maxDate) minDate = maxDate;

	return (
		<div className='flex gap-4'>
			<div className='min-w-[400px] space-y-4'>
				<div className='relative flex items-center justify-evenly pt-1'>
					<div className='font-medium text-sm'>
						{callbacks?.yearLabel
							? callbacks?.yearLabel(menuYear)
							: menuYear}
					</div>
					<div className='flex items-center space-x-1'>
						<button
							onClick={() => {
								setMenuYear(menuYear - 1);
								if (onYearBackward) onYearBackward();
							}}
							className={cn(
								buttonVariants({
									variant: variant?.chevrons ?? 'outline',
								}),
								'absolute left-1 inline-flex h-7 w-7 items-center justify-center p-0',
							)}
						>
							<ChevronLeft className='h-4 w-4 opacity-50' />
						</button>
						<button
							onClick={() => {
								setMenuYear(menuYear + 1);
								if (onYearForward) onYearForward();
							}}
							className={cn(
								buttonVariants({
									variant: variant?.chevrons ?? 'outline',
								}),
								'absolute right-1 inline-flex h-7 w-7 items-center justify-center p-0',
							)}
						>
							<ChevronRight className='h-4 w-4 opacity-50' />
						</button>
					</div>
					<div className='font-medium text-sm'>
						{callbacks?.yearLabel
							? callbacks?.yearLabel(menuYear + 1)
							: menuYear + 1}
					</div>
				</div>
				<table className='w-full border-collapse space-y-1'>
					<tbody>
						{MONTHS.map((monthRow, a: number) => {
							return (
								<tr
									key={`row-${a.toString()}`}
									className='mt-2 flex w-full'
								>
									{monthRow.map((m, i) => {
										return (
											<td
												key={`${m.number}-${m.yearOffset}`}
												className={cn(
													cn(
														cn(
															cn(
																'relative h-10 w-1/4 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
																(menuYear +
																	m.yearOffset >
																	startYear ||
																	(menuYear +
																		m.yearOffset ===
																		startYear &&
																		m.number >
																			startMonth)) &&
																	(menuYear +
																		m.yearOffset <
																		endYear ||
																		(menuYear +
																			m.yearOffset ===
																			endYear &&
																			m.number <
																				endMonth)) &&
																	(rangePending ||
																		endLocked)
																	? 'bg-accent text-accent-foreground'
																	: '',
															),
															menuYear +
																m.yearOffset ===
																startYear &&
																m.number ===
																	startMonth &&
																(rangePending ||
																	endLocked)
																? 'rounded-l-md bg-accent text-accent-foreground'
																: '',
														),
														menuYear +
															m.yearOffset ===
															endYear &&
															m.number ===
																endMonth &&
															(rangePending ||
																endLocked) &&
															menuYear +
																m.yearOffset >=
																startYear &&
															m.number >=
																startMonth
															? 'rounded-r-md bg-accent text-accent-foreground'
															: '',
													),
													i === 3
														? 'mr-2'
														: i === 4
															? 'ml-2'
															: '',
												)}
												onMouseEnter={() => {
													if (
														rangePending &&
														!endLocked
													) {
														setEndYear(
															menuYear +
																m.yearOffset,
														);
														setEndMonth(m.number);
													}
												}}
											>
												<button
													onClick={() => {
														if (rangePending) {
															if (
																menuYear +
																	m.yearOffset <
																	startYear ||
																(menuYear +
																	m.yearOffset ===
																	startYear &&
																	m.number <
																		startMonth)
															) {
																setRangePending(
																	true,
																);
																setEndLocked(
																	false,
																);
																setStartMonth(
																	m.number,
																);
																setStartYear(
																	menuYear +
																		m.yearOffset,
																);
																setEndYear(
																	menuYear +
																		m.yearOffset,
																);
																setEndMonth(
																	m.number,
																);
																if (
																	onStartMonthSelect
																)
																	onStartMonthSelect(
																		new Date(
																			menuYear +
																				m.yearOffset,
																			m.number,
																		),
																	);
															} else {
																setRangePending(
																	false,
																);
																setEndLocked(
																	true,
																);
																// Event fire data selected

																if (
																	onMonthRangeSelect
																)
																	onMonthRangeSelect(
																		{
																			start: new Date(
																				startYear,
																				startMonth,
																			),
																			end: new Date(
																				menuYear +
																					m.yearOffset,
																				m.number,
																			),
																		},
																	);
															}
														} else {
															setRangePending(
																true,
															);
															setEndLocked(false);
															setStartMonth(
																m.number,
															);
															setStartYear(
																menuYear +
																	m.yearOffset,
															);
															setEndYear(
																menuYear +
																	m.yearOffset,
															);
															setEndMonth(
																m.number,
															);
															if (
																onStartMonthSelect
															)
																onStartMonthSelect(
																	new Date(
																		menuYear +
																			m.yearOffset,
																		m.number,
																	),
																);
														}
													}}
													disabled={
														(maxDate
															? menuYear +
																	m.yearOffset >
																	maxDate?.getFullYear() ||
																(menuYear +
																	m.yearOffset ===
																	maxDate?.getFullYear() &&
																	m.number >
																		maxDate.getMonth())
															: false) ||
														(minDate
															? menuYear +
																	m.yearOffset <
																	minDate?.getFullYear() ||
																(menuYear +
																	m.yearOffset ===
																	minDate?.getFullYear() &&
																	m.number <
																		minDate.getMonth())
															: false)
													}
													className={cn(
														buttonVariants({
															variant:
																(startMonth ===
																	m.number &&
																	menuYear +
																		m.yearOffset ===
																		startYear) ||
																(endMonth ===
																	m.number &&
																	menuYear +
																		m.yearOffset ===
																		endYear &&
																	!rangePending)
																	? (variant
																			?.calendar
																			?.selected ??
																		'default')
																	: (variant
																			?.calendar
																			?.main ??
																		'ghost'),
														}),
														'h-full w-full p-0 font-normal aria-selected:opacity-100',
													)}
												>
													{callbacks?.monthLabel
														? callbacks.monthLabel(
																m,
															)
														: m.name}
												</button>
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{showQuickSelectors ? (
				<div className=' flex flex-col justify-center gap-1'>
					{quickSelectors.map(s => {
						return (
							<Button
								onClick={() => {
									setStartYear(s.startMonth.getFullYear());
									setStartMonth(s.startMonth.getMonth());
									setEndYear(s.endMonth.getFullYear());
									setEndMonth(s.endMonth.getMonth());
									setRangePending(false);
									setEndLocked(true);
									if (onMonthRangeSelect)
										onMonthRangeSelect({
											start: s.startMonth,
											end: s.endMonth,
										});
									if (s.onClick) s.onClick(s);
								}}
								key={s.label}
								variant={s.variant ?? 'outline'}
							>
								{s.label}
							</Button>
						);
					})}
				</div>
			) : null}
		</div>
	);
}

MonthRangePicker.displayName = 'MonthRangePicker';

export { MonthRangePicker, type MonthRangeCalProps };
