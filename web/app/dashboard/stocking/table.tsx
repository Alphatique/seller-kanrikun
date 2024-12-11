'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import tmpData from './tmp-data';

const headers: string[] = [
	'カテゴリー',
	'サブカテゴリー',
	'ASIN',
	'過去90日総販売個数',
	'過去30日総販売個数',
	'在庫数',
	'在庫日数 (何日分の在庫が残っているか)',
	'推奨在庫水準(TIP = 1.5か月分 = 45日分)',
	'倉庫納品完了までのリードタイム日数 (日)',
	'リードタイム分の必要個数',
	'推奨発注個数',
	'TIP',
	'要発注',
	'欠品リスク',
];

export default function StockingTable() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					{headers.map((header, index) => (
						<TableHead key={`header-${header}`}>{header}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{tmpData.map((data, index) => {
					const daysInStock = data.stockCount / data.salesCountPast30Days / 30;
					const recommendedStockLevel = (data.salesCountPast30Days / 30) * 45;
					const leadTime = 30;
					const leadTimeStock = (data.salesCountPast30Days / 30) * leadTime;
					const recommendedOrder =
						recommendedStockLevel - daysInStock - leadTimeStock;

					const orderRequired = data.stockCount > recommendedOrder * 1.5;
					const risk = data.stockCount > leadTime;
					return (
						<TableRow key={`row-${index.toString()}`}>
							<TableCell>{data.category}</TableCell>
							<TableCell>{data.subCategory}</TableCell>
							<TableCell>{data.asin}</TableCell>
							<TableCell>{data.salesCountPast90Days}</TableCell>
							<TableCell>{data.salesCountPast30Days}</TableCell>
							<TableCell>{data.stockCount}</TableCell>
							<TableCell>{daysInStock.toFixed(2)}</TableCell>
							<TableCell>{recommendedStockLevel}</TableCell>
							<TableCell>{leadTime}</TableCell>
							<TableCell>{leadTimeStock}</TableCell>
							<TableCell>{recommendedOrder}</TableCell>
							<TableCell />
							<TableCell>{orderRequired ? '問題なし' : '用受注'}</TableCell>
							<TableCell>{risk ? '問題なし' : '欠品リスク高'}</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
