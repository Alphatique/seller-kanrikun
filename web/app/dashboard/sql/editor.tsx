'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { Textarea } from '@seller-kanrikun/ui/components/textarea';

import {
	createCostPriceTable,
	createInventoryTable,
	createSalesTrafficReportTable,
	createSettlementReportTable,
	initDuckDB,
} from '~/lib/duckdb';
import { fetchGunzipStrApi } from '~/lib/fetch-gzip';

import { SqlResult } from './result';

export function SqlEditor() {
	// データ取得
	const { data: settlementReport } = useSWR(
		'/api/reports/settlement',
		fetchGunzipStrApi,
	);
	const { data: salestrafficReport } = useSWR(
		'/api/reports/sales-traffic',
		fetchGunzipStrApi,
	);
	const { data: inventoryData } = useSWR('/api/inventory', fetchGunzipStrApi);
	const { data: costPriceData } = useSWR(
		'/api/cost-price',
		fetchGunzipStrApi,
	);
	// duckdb
	const { data: myDuckDB } = useSWR('/initDuckDB', initDuckDB);

	const [sqlText, setSqlText] = useState<string>('');

	// データ/dbが更新されたら
	// TODO: jotai等を使ってreactから切り離す
	useEffect(() => {
		if (
			myDuckDB &&
			settlementReport &&
			salestrafficReport &&
			inventoryData &&
			costPriceData
		) {
			createSettlementReportTable(myDuckDB, settlementReport);
			createSalesTrafficReportTable(myDuckDB, salestrafficReport);
			createInventoryTable(myDuckDB, inventoryData);
			createCostPriceTable(myDuckDB, costPriceData);
		}
	}, [
		myDuckDB,
		settlementReport,
		salestrafficReport,
		inventoryData,
		costPriceData,
	]);

	return (
		<div className='grid gap-3'>
			<Textarea
				placeholder='input sql'
				value={sqlText}
				onChange={e => {
					setSqlText(e.target.value);
				}}
			/>

			<SqlResult myDuckDB={myDuckDB} sqlText={sqlText} />
		</div>
	);
}
