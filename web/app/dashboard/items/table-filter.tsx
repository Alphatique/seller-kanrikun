'use client';

import { useState } from 'react';

import { Button } from '@seller-kanrikun/ui/components/button';
import { Input } from '@seller-kanrikun/ui/components/input';
import { MultiSelect } from '@seller-kanrikun/ui/components/multi-select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import { PopoverMonthRangePicker } from '~/components/popover-month-range-picker';
import downloadCsv from '~/lib/csv-download';

import TmpData from './tmp-data';

const dataHeader = [
	'所属カテゴリー名',
	'所属サブカテゴリー名',
	'ASIN',
	'商品名',
	'年月',
	'総売上',
	'返品額',
	'純売上',
	'総販売個数',
	'返品個数',
	'純販売個数',
	'平均販売価格(円／税抜)',
	'総原価',
	'返品原価',
	'純原価',
	'平均原価',
	'純粗利額',
	'棚卸資産額',
	'在庫個数(FBA在庫)',
];

export function ItemsTableFilter() {
	const categoryArray: Record<string, string> = {};
	const subCategoryArray: Record<string, string> = {};

	for (const data of TmpData) {
		categoryArray[data.category] = data.category;
		subCategoryArray[data.subCategory] = data.subCategory;
	}

	const [categorySelects, setCategorySelects] = useState<string[]>(
		Object.keys(categoryArray),
	);
	const [subCategorySelects, setSubCategorySelects] = useState<string[]>(
		Object.keys(subCategoryArray),
	);

	const [filterText, setFilterText] = useState<string>('');

	const [monthRange, setMonthRange] = useState<{ start: Date; end: Date }>({
		start: new Date(),
		end: new Date(),
	});

	const filteredData = TmpData.filter(data => {
		// カテゴリー選択
		if (
			!categorySelects.includes(data.category) ||
			!subCategorySelects.includes(data.subCategory)
		) {
			return false;
		}
		// テキストフィルター
		if (
			filterText !== '' &&
			!data.itemName.includes(filterText) &&
			!data.asin.includes(filterText)
		) {
			return false;
		}
		// 月選択
		const yearMonth = new Date(data.yearMonth);
		console.log(yearMonth);
		if (yearMonth < monthRange.start || yearMonth > monthRange.end) {
			return false;
		}

		return true;
	});

	const handleDownload = () => {
		downloadCsv(filteredData, dataHeader, '商品別明細.csv');
	};

	return (
		<>
			<div className='flex items-center gap-2'>
				<MultiSelect
					values={categoryArray}
					selects={categorySelects}
					onSelectChange={setCategorySelects}
				/>
				<MultiSelect
					values={subCategoryArray}
					selects={subCategorySelects}
					onSelectChange={setSubCategorySelects}
				/>
				<Input
					className='w-1/6'
					placeholder='SKU、ASIN、商品名でフィルター'
					value={filterText}
					onChange={e => setFilterText(e.target.value)}
				/>
				<PopoverMonthRangePicker
					value={monthRange}
					onMonthRangeSelect={setMonthRange}
				/>
				<Button onClick={handleDownload}>ダウンロード</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						{dataHeader.map((header, index) => {
							return (
								<TableHead key={`${header}-${index.toString()}`}>
									{header}
								</TableHead>
							);
						})}
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredData.map((data, index) => {
						return (
							<TableRow key={`${data.itemName}-${index.toString()}`}>
								<TableCell>{data.category}</TableCell>
								<TableCell>{data.subCategory}</TableCell>
								<TableCell>{data.asin}</TableCell>
								<TableCell>{data.itemName}</TableCell>
								<TableCell>{data.yearMonth}</TableCell>
								<TableCell>{data.totalSales}</TableCell>
								<TableCell>{data.returnAmount}</TableCell>
								<TableCell>{data.netSales}</TableCell>
								<TableCell>{data.totalSalesCount}</TableCell>
								<TableCell>{data.returnCount}</TableCell>
								<TableCell>{data.netSalesCount}</TableCell>
								<TableCell>{data.averageSalesPrice}</TableCell>
								<TableCell>{data.totalCost}</TableCell>
								<TableCell>{data.returnCost}</TableCell>
								<TableCell>{data.netCost}</TableCell>
								<TableCell>{data.averageCost}</TableCell>
								<TableCell>{data.netGrossProfit}</TableCell>
								<TableCell>{data.inventoryAssets}</TableCell>
								<TableCell>{data.stockCount}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</>
	);
}
