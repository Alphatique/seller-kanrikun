import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import TmpData from './tmp-data';

export default function ItemsFilterTable() {
	return (
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
	);
}
