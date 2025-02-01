import { format, isAfter, isBefore, startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';

import type { ChartConfig } from '@seller-kanrikun/ui/components/chart';

import { BarChart } from '~/components/bar-chart';
import { LineChart } from '~/components/line-chart';

import { formatValue } from './data-filter';

interface Props {
	period: Period;
	items: Record<string, string>;
	selectsItems: string[];
	selectData: keyof SessionCvrData;
	dateRange: DateRange | undefined;
	sessionCvrData: SessionCvrData[] | undefined;
}

export function Chart({
	period,
	items,
	selectsItems,
	selectData,
	dateRange,
	sessionCvrData,
}: Props) {
	const chartData = useMemo(() => {
		if (!(sessionCvrData && dateRange?.from && dateRange?.to)) return [];
		if (selectData === 'date') return [];
		type itemKeys = (typeof items)[number] | 'date';
		const dateResult: Record<string, Record<itemKeys, number>> = {};
		for (const data of sessionCvrData) {
			if (!selectsItems.includes(data.asin)) continue;
			if (
				isAfter(data.date, dateRange.from) &&
				isBefore(data.date, dateRange.to)
			) {
				const dateStr =
					period === 'daily'
						? data.date.toString()
						: period === 'weekly'
							? startOfWeek(data.date, {
									weekStartsOn: 1,
								}).toString()
							: period === 'monthly'
								? format(data.date, 'yyyy-MM')
								: period === 'quarterly'
									? format(data.date, 'yyyy-Q')
									: format(data.date, 'yyyy');
				if (!dateResult[dateStr]) {
					dateResult[dateStr] = {};
				}
				// Nan, +-infinityを0にしていく
				const value = formatValue(Number(data[selectData]));
				if (dateResult[dateStr][data.asin]) {
					const existValue = dateResult[dateStr][data.asin];
					dateResult[dateStr][data.asin] = existValue + value;
				} else {
					dateResult[dateStr][data.asin] = value;
				}
			}
		}

		// 配列に展開
		const result = [];
		for (const [key, value] of Object.entries(dateResult)) {
			const data: Record<string, number | string> = value;
			data.date = key;
			result.push(data);
		}
		return result.reverse();
	}, [sessionCvrData, selectData, selectsItems, dateRange, period]);

	return (
		<>
			{selectData === 'sales' || selectData === 'units' ? (
				<BarChart
					data={chartData}
					config={Object.entries(items).reduce(
						(acc, [key, label], i) => {
							acc[key] = {
								label,
								color: `hsl(var(--chart-${i + 1}))`,
							};
							return acc;
						},
						{} as ChartConfig,
					)}
				/>
			) : (
				<LineChart
					data={chartData}
					config={Object.entries(items).reduce(
						(acc, [key, label], i) => {
							acc[key] = {
								label,
								color: `hsl(var(--chart-${i + 1}))`,
							};
							return acc;
						},
						{} as ChartConfig,
					)}
				/>
			)}
		</>
	);
}
