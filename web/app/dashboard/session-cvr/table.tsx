import {
	format,
	startOfDay,
	startOfMonth,
	startOfQuarter,
	startOfWeek,
	startOfYear,
	subDays,
	subMonths,
	subQuarters,
	subWeeks,
	subYears,
} from 'date-fns';
import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';

import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import { formatValue } from './data-filter';

const headers: string[] = [
	'商品名',
	'日付',
	'売上',
	'売上個数',
	'平均単価',
	'アクセス数',
	'CVRセッション',
	'CVRページビュー',
	'ROAS',
	'ACOS',
];

interface Props {
	period: Period;
	selectsItems: string[];
	selectData: keyof SessionCvrData;
	dateRange: DateRange | undefined;
	sessionCvrData: SessionCvrData[] | undefined;
}

interface TableData {
	nowData: Record<string, SessionCvrData>;
	previousData: Record<string, SessionCvrData>;
	lastYearData: Record<string, SessionCvrData>;
}

export function SessionTable({
	period,
	selectsItems,
	selectData,
	dateRange,
	sessionCvrData,
}: Props) {
	const tableData: TableData | [] = useMemo(() => {
		if (!(sessionCvrData && dateRange?.from && dateRange?.to)) return [];
		if (selectData === 'date') return [];

		const nowDay = new Date();
		const lastYearDay = subYears(nowDay, 1);
		// 今
		const nowDataDay = getPeriodFirstDay(
			period,
			getPeriodPreviousDay(period, nowDay),
		);
		// 期間に合わせてひとつ前
		const previousDataDay = getPeriodPreviousDay(period, nowDataDay);
		// 去年
		const lastYearDataDay = getPeriodPreviousDay('yearly', nowDataDay);

		const dateResult: Record<string, Record<string, SessionCvrData>> = {
			[nowDataDay.toString()]: {},
			[previousDataDay.toString()]: {},
			[lastYearDataDay.toString()]: {},
		};
		for (const data of sessionCvrData) {
			if (!selectsItems.includes(data.asin)) continue;
			const dataDayStr = getPeriodFirstDay(period, data.date).toString();
			if (dateResult[dataDayStr]) {
				const existData = dateResult[dataDayStr][data.asin];
				const formatData = {
					date: data.date,
					name: data.name,
					asin: data.asin,
					sales: formatValue(data.sales),
					units: formatValue(data.units),
					averagePrice: formatValue(data.averagePrice),
					pageViews: formatValue(data.pageViews),
					sessionCvr: formatValue(data.sessionCvr),
					pageViewCvr: formatValue(data.pageViewCvr),
					roas: formatValue(data.roas),
					acos: formatValue(data.acos),
				};
				if (existData) {
					dateResult[dataDayStr][data.asin] = {
						date: data.date,
						name: data.name,
						asin: data.asin,
						sales: existData.sales + formatData.sales,
						units: existData.units + formatData.units,
						averagePrice:
							existData.averagePrice + formatData.averagePrice,
						pageViews: existData.pageViews + formatData.pageViews,
						sessionCvr:
							existData.sessionCvr + formatData.sessionCvr,
						pageViewCvr:
							existData.pageViewCvr + formatData.pageViewCvr,
						roas: existData.roas + formatData.roas,
						acos: existData.acos + formatData.acos,
					};
				} else {
					dateResult[dataDayStr][data.asin] = formatData;
				}
			}
		}

		// 配列に展開
		return {
			nowData: dateResult[nowDataDay.toString()],
			previousData: dateResult[previousDataDay.toString()],
			lastYearData: dateResult[lastYearDataDay.toString()],
		};
	}, [sessionCvrData, selectsItems, dateRange, period]);

	function getPeriodPreviousDay(period: Period, day: Date) {
		return period === 'daily'
			? // 昨日
				subDays(day, 1)
			: period === 'weekly'
				? // 先週
					subWeeks(day, 1)
				: period === 'monthly'
					? // 先月
						subMonths(day, 1)
					: period === 'quarterly'
						? // ひとつ前の四半期
							subQuarters(day, 1)
						: // 去年
							subYears(day, 1);
	}

	function getPeriodFirstDay(period: Period, day: Date) {
		return period === 'daily'
			? startOfDay(day)
			: period === 'weekly'
				? startOfWeek(day, { weekStartsOn: 1 }) // 月曜始まり
				: period === 'monthly'
					? startOfMonth(day)
					: period === 'quarterly'
						? startOfQuarter(day)
						: startOfYear(day);
	}

	function roundValue(value: number | null): string {
		if (value === null || value === undefined) return '-';
		return (Math.round(value * 10) / 10).toString(); // 小数点第1位で丸める
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{headers.map((header, index) => (
						<TableCell key={`${header}-${index.toString()}`}>
							{header}
						</TableCell>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.isArray(tableData) ||
				!tableData.nowData ||
				Object.values(tableData.nowData).length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={headers.length + 1}
							style={{ textAlign: 'center' }}
						>
							データがありません
						</TableCell>
					</TableRow>
				) : (
					Object.values(tableData.nowData).map((data, index) => {
						const typedData = data as SessionCvrData;
						const previousData = tableData.previousData
							? tableData.previousData[typedData.asin]
							: null;

						function calculateDifference(
							nowValue: number | null,
							prevValue: number | null,
						): string {
							if (nowValue === null || nowValue === undefined)
								return '-';
							if (prevValue === null || prevValue === undefined)
								return `${roundValue(nowValue)}`;
							const diff = nowValue - prevValue;
							const sign = diff > 0 ? '+' : diff < 0 ? '' : '±';
							return `${roundValue(nowValue)} (${sign}${roundValue(
								diff,
							)})`;
						}

						return (
							<TableRow
								key={`${typedData.asin}-${index.toString()}`}
							>
								<TableCell>{typedData.asin}</TableCell>
								<TableCell>
									{format(typedData.date, 'yyyy/MM/dd')}
								</TableCell>
								<TableCell>
									{calculateDifference(
										formatValue(typedData.sales),
										previousData
											? formatValue(previousData.sales)
											: null,
									)}
								</TableCell>
								<TableCell>
									{calculateDifference(
										formatValue(typedData.units),
										previousData
											? formatValue(previousData.units)
											: null,
									)}
								</TableCell>
								<TableCell>
									{calculateDifference(
										formatValue(typedData.averagePrice),
										previousData
											? formatValue(
													previousData.averagePrice,
												)
											: null,
									)}
								</TableCell>
								<TableCell>
									{calculateDifference(
										formatValue(typedData.pageViews),
										previousData
											? formatValue(
													previousData.pageViews,
												)
											: null,
									)}
								</TableCell>
								<TableCell>
									{calculateDifference(
										formatValue(typedData.sessionCvr),
										previousData
											? formatValue(
													previousData.sessionCvr,
												)
											: null,
									)}
								</TableCell>
								<TableCell>
									{calculateDifference(
										formatValue(typedData.pageViewCvr),
										previousData
											? formatValue(
													previousData.pageViewCvr,
												)
											: null,
									)}
								</TableCell>
								<TableCell>
									{calculateDifference(
										formatValue(typedData.roas),
										previousData
											? formatValue(previousData.roas)
											: null,
									)}
								</TableCell>
								<TableCell>
									{calculateDifference(
										formatValue(typedData.acos),
										previousData
											? formatValue(previousData.acos)
											: null,
									)}
								</TableCell>
							</TableRow>
						);
					})
				)}
			</TableBody>
		</Table>
	);
}
