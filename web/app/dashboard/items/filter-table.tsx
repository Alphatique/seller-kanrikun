'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import MultiSelect from '@seller-kanrikun/ui/components/multi-select';

import TmpData from './tmp-data';

import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';

import { Button } from '@seller-kanrikun/ui/components/button';
import { Input } from '@seller-kanrikun/ui/components/input';
import { Label } from '@seller-kanrikun/ui/components/label';
import { FilterIcon } from 'lucide-react';
import { useState } from 'react';
import downloadCsv from '~/lib/csv-download';

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

export default function ItemsFilterTable() {
	const [selects, setSelects] = useState<string[]>([]);
	const [filterText, setFilterText] = useState<string>('');

	const goods: Record<string, string> = {};

	const filteredData = TmpData.filter(data => {
		// 商品選択
		if (!selects.includes(data.itemName)) return false;
		// テキストフィルター
		if (
			filterText !== '' &&
			!data.itemName.includes(filterText) &&
			!data.asin.includes(filterText)
		) {
			return false;
		}

		return true;
	});

	for (const data of TmpData) {
		goods[data.itemName] = data.itemName;
	}

	const handleDownload = () => {
		downloadCsv(filteredData, dataHeader, '商品別明細.csv');
	};

	return (
		<>
			<div className='flex items-center gap-2'>
				<MultiSelect
					values={goods}
					selects={selects}
					onSelectChange={setSelects}
				/>
				<Input
					className='w-1/6'
					placeholder='SKU、ASIN、商品名でフィルター'
					value={filterText}
					onChange={e => setFilterText(e.target.value)}
				/>
				<Label>出品ステータス</Label>
				<Select>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='すべての商品' />
					</SelectTrigger>
					<SelectContent />
				</Select>
				<Label>出荷元</Label>
				<Select>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='すべての商品' />
					</SelectTrigger>
					<SelectContent />
				</Select>
				<Button>
					<FilterIcon />
					すべてのフィルター
				</Button>
				<Button>データ更新</Button>
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
