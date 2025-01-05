'use client';

import type * as arrow from 'apache-arrow';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { useSession } from '@seller-kanrikun/auth/client';
import {
	calcPlbsWithTax,
	calcPlbsWithoutTax,
	reportArrowTableToArrays,
} from '@seller-kanrikun/data-operation/calc-pl-bs';
import { calcPlbsSql } from '@seller-kanrikun/data-operation/sql';
import type {
	FilteredSettlementReport,
	PlBsWithTax,
	PlBsWithoutTax,
} from '@seller-kanrikun/data-operation/types/pl-bs';
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
import { fetchGunzipStrApi } from '~/lib/fetch-gunzip';

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
	const [filteredData, setFilteredData] = useState<
		FilteredSettlementReport[] | undefined
	>(undefined);

	// グルーピングのピリオド
	const [period, setPeriod] = useState<Period>('monthly');
	// 日付フィルター
	const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
		start: new Date(),
		end: new Date(),
	});
	// 税込みか税抜きか
	const [withTax, setWithTax] = useState<boolean>(true);

	// データ/dbが更新されたら
	// TODO: jotai等を使ってreactから切り離す
	useEffect(() => {
		if (myDuckDB && reportData && inventoryData && costPriceData) {
			const promises = [];
			promises.push(createSettlementReportTable(myDuckDB, reportData));
			promises.push(createInventoryTable(myDuckDB, inventoryData));
			promises.push(createCostPriceTable(myDuckDB, costPriceData));
			Promise.all(promises).then(async () => {
				// テーブルが作成されているか確認
				const checkedTable = await checkTables(myDuckDB, [
					'settlement_report',
					'inventory_summaries',
					'cost_price',
				]);
				if (checkedTable.length !== 3) return;

				// フィルターしたデータを取得
				const filteredResponse = await myDuckDB.c.query(calcPlbsSql);
				console.log(filteredResponse.toString());

				// データのjs array化
				const formatData: FilteredSettlementReport[] = [];
				for (let i = 0; i < filteredResponse.numRows; i++) {
					const record = filteredResponse.get(i);
					const json = record?.toJSON();

					// TODO: zodでやりたい
					const data: FilteredSettlementReport = {
						date: json?.date,
						costPrice: Number(json?.costPrice),
						principal: json?.principal,
						principalTax: json?.principalTax,
						shipping: json?.shipping,
						shippingTax: json?.shippingTax,
						refund: json?.refund,
						promotion: json?.promotion,
						commissionFee: json?.commissionFee,
						fbaShippingFee: json?.fbaShippingFee,
						inventoryStorageFee: json?.inventoryStorageFee,
						inventoryUpdateFee: json?.inventoryUpdateFee,
						shippingReturnFee: json?.shippingReturnFee,
						accountSubscriptionFee: json?.accountSubscriptionFee,
						accountsReceivable: json?.accountsReceivable,
					};
					formatData.push(data);
				}

				console.log(formatData);
				setFilteredData(formatData);
			});
		}
	}, [myDuckDB, reportData, inventoryData, costPriceData]);

	const { withTax: plbsWithTax, withoutTax: plbsWithoutTax } = useMemo(() => {
		if (!filteredData) return { withTax: undefined, withoutTax: undefined };
		// PLBS計算
		return {
			withTax: calcPlbsWithTax(filteredData),
			withoutTax: calcPlbsWithoutTax(filteredData),
		};
	}, [filteredData]);

	const groupedDataIndexes: Record<string, number[]> = useMemo(
		() => {
			// フィルターしたデータがない場合はからデータを返す
			if (!filteredData) return {};
			// 仮データ
			const dateIndexes: Record<string, number[]> = {};
			// データの行数分繰り返す
			for (let i = 0; i < filteredData.length; i++) {
				// その行の日付を取得
				const date = new Date(filteredData[i].date);
				// 日付が範囲内かどうかを判定
				if (dateRange.start <= date && dateRange.end >= date) {
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
					// グループ化したデータを登録
					if (!dateIndexes[dateStr]) {
						// まだグループがない場合は配列初期化
						dateIndexes[dateStr] = [];
					}
					// インデックスを登録
					dateIndexes[dateStr].push(i);
				}
			}
			// グループ化したデータを登録
			return dateIndexes;
		},
		[dateRange, filteredData, period], // dateRange, filteredData, periodが更新された場合に反応する
	);
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
						<SelectItem value='monthly'>Monthly</SelectItem>
						<SelectItem value='quarterly'>Quarterly</SelectItem>
						<SelectItem value='yearly'>Yearly</SelectItem>
					</SelectContent>
				</Select>
				<div className='flex items-center space-x-2'>
					<Switch
						id='airplane-mode'
						checked={withTax}
						onCheckedChange={setWithTax}
					/>
					<Label htmlFor='airplane-mode'>Without Tax</Label>
				</div>
				<PopoverMonthRangePicker
					value={dateRange}
					onMonthRangeSelect={setDateRange}
				/>
			</div>
			<PlbsTable
				title={'PL'}
				tableInfo={withTax ? plTableWithTaxInfo : plTableWithoutTaxInfo}
				groupedDataIndexes={groupedDataIndexes}
				filteredReport={filteredData}
				plbsDataWithTax={plbsWithTax}
				plbsDataWithoutTax={plbsWithoutTax}
			/>

			<PlbsTable
				title={'BS'}
				tableInfo={withTax ? bsTableWithTaxInfo : bsTableWithoutTax}
				groupedDataIndexes={groupedDataIndexes}
				filteredReport={filteredData}
				plbsDataWithTax={plbsWithTax}
				plbsDataWithoutTax={plbsWithoutTax}
			/>
		</div>
	);
}
