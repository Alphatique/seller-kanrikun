'use client';

import { format, subMonths } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import {
	addFormattedReports,
	calcPlbsWithTax,
	calcPlbsWithoutTax,
} from '@seller-kanrikun/data-operation/calc-pl-bs';
import { calcPlbsSql } from '@seller-kanrikun/data-operation/sql';
import type { FormattedSettlementReport } from '@seller-kanrikun/data-operation/types/pl-bs';
import { Button } from '@seller-kanrikun/ui/components/button';
import { Label } from '@seller-kanrikun/ui/components/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';
import { Switch } from '@seller-kanrikun/ui/components/switch';

import { PopoverMonthRangePicker } from '~/components/popover-month-range-picker';
import {
	checkTables,
	createCostPriceTable,
	createInventoryTable,
	createSettlementReportTable,
	initDuckDB,
} from '~/lib/duckdb';
import { fetchGunzipStrApi } from '~/lib/fetch-gzip';

import { downloadCsv } from '~/lib/file-downloads';
import { PlbsTable } from './table';
import {
	bsTableWithTaxInfo,
	bsTableWithoutTax,
	plTableWithTaxInfo,
	plTableWithoutTaxInfo,
} from './table-meta';

export function PlbsTableFilter() {
	// データ取得
	const { data: reportData } = useSWR(
		'/api/reports/settlement',
		fetchGunzipStrApi,
	);
	const { data: inventoryData } = useSWR('/api/inventory', fetchGunzipStrApi);
	const { data: costPriceData } = useSWR(
		'/api/cost-price',
		fetchGunzipStrApi,
	);
	// duckdb
	const { data: myDuckDB } = useSWR('/initDuckDB', initDuckDB);

	// フィルターしたデータ
	const [formattedData, setFormattedData] = useState<
		Record<number, FormattedSettlementReport> | undefined
	>(undefined);

	const [period, setPeriod] = useState<Period>('monthly');
	const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
		start: subMonths(new Date(), 7),
		end: new Date(),
	});

	// 税込みか税抜きか
	const [withTax, setWithTax] = useState<boolean>(true);

	// データ/dbが更新されたら
	// TODO: jotai等を使ってreactから切り離す
	useEffect(() => {
		// console.log(reportData, inventoryData, costPriceData);
		if (myDuckDB && reportData && inventoryData && costPriceData) {
			const promises = [];
			promises.push(createSettlementReportTable(myDuckDB, reportData));
			promises.push(createInventoryTable(myDuckDB, inventoryData));
			promises.push(createCostPriceTable(myDuckDB, costPriceData));
			Promise.all(promises).then(async () => {
				// テーブルが作成されているか確認
				const checkedTable = await checkTables(myDuckDB, [
					'settlementReport',
					'inventorySummaries',
					'costPrice',
				]);
				if (checkedTable.length !== 3) return;

				// フィルターしたデータを取得
				const filteredResponse = await myDuckDB.c.query(calcPlbsSql);

				// データのjs array化
				const formattedData: Record<number, FormattedSettlementReport> =
					{};
				for (let i = 0; i < filteredResponse.numRows; i++) {
					const record = filteredResponse.get(i);
					const json = record?.toJSON();

					// TODO: zodでやりたい
					const data: FormattedSettlementReport = {
						costPrice: Number(json?.costPrice),
						principal: Number(json?.principal),
						principalTax: Number(json?.principalTax),
						shipping: Number(json?.shipping),
						shippingTax: Number(json?.shippingTax),
						refund: Number(json?.refund),
						promotion: Number(json?.promotion),
						commissionFee: Number(json?.commissionFee),
						fbaShippingFee: Number(json?.fbaShippingFee),
						inventoryStorageFee: Number(json?.inventoryStorageFee),
						inventoryUpdateFee: Number(json?.inventoryUpdateFee),
						shippingReturnFee: Number(json?.shippingReturnFee),
						accountSubscriptionFee: Number(
							json?.accountSubscriptionFee,
						),
						accountsReceivable: Number(json?.accountsReceivable),
					};

					formattedData[json?.date] = data;
				}

				setFormattedData(formattedData);
			});
		}
	}, [myDuckDB, reportData, inventoryData, costPriceData]);

	const filteredReport: Record<string, FormattedSettlementReport> =
		useMemo(() => {
			if (formattedData === undefined) return {};
			const filteredData: Record<string, FormattedSettlementReport> = {};
			for (const [dateTime, data] of Object.entries(formattedData)) {
				// その行の日付を取得
				const date = new Date(Number(dateTime));
				if (dateRange.start <= date && dateRange.end >= date) {
					// 日付が範囲内かどうかを判定
					// 日付からグループ化する文字列を作成
					// TODO: 三項演算子的な
					let dateStr = '';
					switch (period) {
						case 'monthly':
							dateStr = format(date, 'yyyy-MM');
							break;
						case 'quarterly':
							dateStr = format(date, 'yyyy-Q');
							break;
						case 'yearly':
							dateStr = format(date, 'yyyy');
							break;
					}
					// 既存のデータがある場合
					if (filteredData[dateStr]) {
						// 既存のデータと足し算
						filteredData[dateStr] = addFormattedReports(
							filteredData[dateStr],
							data,
						);
					} else {
						// まだグループがない場合はそのまま入れる
						filteredData[dateStr] = data;
					}
				}
			}
			return filteredData;
		}, [formattedData, dateRange, period]);

	const filteredAndPlbsData: Record<
		string,
		Record<string, number>
	> = useMemo(() => {
		// PLBS計算
		const plbsData = withTax
			? calcPlbsWithTax(filteredReport)
			: calcPlbsWithoutTax(filteredReport);

		return Object.keys(filteredReport).reduce(
			(acc, key, idx) => {
				acc[key] = {
					...filteredReport[key],
					...plbsData[idx],
				};
				return acc;
			},
			{} as Record<string, Record<string, number>>,
		);
	}, [filteredReport, withTax]);

	function handleDownload() {
		if (!(dateRange?.start && dateRange?.end)) return;
		const downloadData = Object.entries(filteredAndPlbsData).map(
			([date, values]) => ({
				date,
				...values,
			}),
		);
		if (downloadData.length === 0) return;

		const filename = `plbs_${withTax ? 'withTax' : 'withoutTax'}_${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}.csv`;
		downloadCsv(downloadData, Object.keys(downloadData[0]), filename);
	}

	return (
		<div className='grid gap-3'>
			<div className='flex justify-start gap-3 align-center'>
				<Select
					value={period}
					onValueChange={(value: Period) => {
						setPeriod(value);
					}}
				>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='period' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='monthly'>月</SelectItem>
						<SelectItem value='quarterly'>四半期</SelectItem>
						<SelectItem value='yearly'>年</SelectItem>
					</SelectContent>
				</Select>
				<div className='flex items-center space-x-2'>
					<Switch
						id='airplane-mode'
						checked={withTax}
						onCheckedChange={setWithTax}
					/>
					<Label htmlFor='airplane-mode'>税抜き</Label>
				</div>
				<PopoverMonthRangePicker
					value={dateRange}
					onMonthRangeSelect={setDateRange}
				/>
				<Button onClick={handleDownload}>ダウンロード</Button>
			</div>
			<PlbsTable
				title={'PL'}
				tableInfo={withTax ? plTableWithTaxInfo : plTableWithoutTaxInfo}
				tableData={filteredAndPlbsData}
			/>

			<PlbsTable
				title={'BS'}
				tableInfo={withTax ? bsTableWithTaxInfo : bsTableWithoutTax}
				tableData={filteredAndPlbsData}
			/>
		</div>
	);
}
