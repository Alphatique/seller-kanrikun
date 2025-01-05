import {
	format,
	isAfter,
	isBefore,
	previousDay,
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
import { useEffect, useMemo, useState } from 'react';
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
	'CVRユニットセッション',
	'CVRユニットページビュー',
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

export function SessionTable({
	period,
	selectsItems,
	selectData,
	dateRange,
	sessionCvrData,
}: Props) {
	const tableData = useMemo(() => {
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
		return dateResult;
	}, [sessionCvrData, selectData, selectsItems, dateRange, period]);

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

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{headers.map((header, index) => {
						return (
							<TableCell key={`${header}-${index.toString()}`}>
								{header}
							</TableCell>
						);
					})}
				</TableRow>
			</TableHeader>
			<TableBody>
				{/*tableData.map((data, index) => {
					return (
						<TableRow key={`${data.asin}-${index.toString()}`}>
							<TableCell>{data.asin}</TableCell>
							<TableCell>{data.sales}</TableCell>
							<TableCell>{data.units}</TableCell>
							<TableCell>{data.averagePrice}</TableCell>
							<TableCell>{data.pageViews}</TableCell>
							<TableCell>{data.sessionCvr}</TableCell>
							<TableCell>{data.pageViewCvr}</TableCell>
							<TableCell>{data.roas}</TableCell>
							<TableCell>{data.acos}</TableCell>
						</TableRow>
					);
				})*/}
			</TableBody>
		</Table>
	);
}
