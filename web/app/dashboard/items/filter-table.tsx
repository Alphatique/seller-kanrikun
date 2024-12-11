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

export default function ItemsFilterTable() {
	const [selects, setSelects] = useState<string[]>([]);

	const goods: Record<string, string> = {};

	for (const data of TmpData) {
		goods[data.itemName] = data.itemName;
	}

	return (
		<>
			<div className='flex items-center gap-2'>
				<MultiSelect
					values={goods}
					selects={selects}
					onSelectChange={setSelects}
				/>
				<Input className='w-1/6' placeholder='SKU、ASIN、商品名でフィルター' />
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
				<Button>ダウンロード</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>所属カテゴリー名</TableHead>
						<TableHead>所属サブカテゴリー名</TableHead>
						<TableHead>ASIN</TableHead>
						<TableHead>商品名</TableHead>
						<TableHead>年月</TableHead>
						<TableHead>総売上</TableHead>
						<TableHead>返品額</TableHead>
						<TableHead>純売上</TableHead>
						<TableHead>総販売個数</TableHead>
						<TableHead>返品個数</TableHead>
						<TableHead>純販売個数</TableHead>
						<TableHead>平均販売価格(円／税抜)</TableHead>
						<TableHead>総原価</TableHead>
						<TableHead>返品原価</TableHead>
						<TableHead>純原価</TableHead>
						<TableHead>平均原価</TableHead>
						<TableHead>純粗利額</TableHead>
						<TableHead>棚卸資産額</TableHead>
						<TableHead>在庫個数(FBA在庫)</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{TmpData.map((data, index) => {
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
