import { Separator } from '@seller-kanrikun/ui/components/separator';

import {
	Table,
	TableBody,
	TableCell,
} from '@seller-kanrikun/ui/components/table';
import {
	HeadTableRow,
	IndentTableCell,
	PlbsTableRow,
} from '@seller-kanrikun/ui/components/table-pl-bs';

export const metadata: Metadata = {
	title: 'PL/BS | セラー管理君',
};

type TableMetaData = {
	key: string;
	head: string;
	indent: number;
	underLine?: boolean;
	doubleUnderLine?: boolean;
};

const plTableWithTax: TableMetaData[] = [
	{
		key: 'sales',
		head: '売上',
		indent: 1,
	},
	{
		key: 'principal',
		head: '商品代金',
		indent: 2,
	},
	{
		key: 'principalTax',
		head: '消費税',
		indent: 2,
	},
	{
		key: 'shipping',
		head: '送料',
		indent: 2,
	},
	{
		key: 'shippingTax',
		head: '消費税',
		indent: 2,
	},
	{
		key: 'refund',
		head: '返品額',
		indent: 1,
	},
	{
		key: 'netSales',
		head: '純売上',
		indent: 1,
	},
	{
		key: 'costPrice',
		head: '原価',
		indent: 1,
	},
	{
		key: 'grossProfit',
		head: '粗利益',
		indent: 1,
		underLine: true,
	},
	{
		key: 'sga',
		head: '販売費および一般管理費',
		indent: 1,
	},
	{
		key: 'amazonAds',
		head: '広告費',
		indent: 2,
	},
	{
		key: 'promotion',
		head: 'プロモーション費用',
		indent: 2,
	},
	{
		key: 'salesCommission',
		head: '販売手数料',
		indent: 2,
	},
	{
		key: 'fbaShippingFee',
		head: 'FBA出荷手数料',
		indent: 2,
	},
	{
		key: 'inventoryStorageFee',
		head: '在庫保管料',
		indent: 2,
	},
	{
		key: 'inventoryUpdateFee',
		head: '在庫更新費用',
		indent: 2,
	},
	{
		key: 'shippingReturnFee',
		head: '配送返戻金',
		indent: 2,
	},
	{
		key: 'subscriptionFee',
		head: 'アカウント月額登録料',
		indent: 2,
	},
	{
		key: 'amazonOther',
		head: 'Amazonその他',
		indent: 1,
		doubleUnderLine: true,
	},
	{
		key: 'operatingProfit',
		head: '営業利益',
		indent: 1,
	},
];

const indexTable: TableMetaData[] = [
	{
		key: 'grossProfitRate',
		head: '粗利率',
		indent: 1,
	},
	{
		key: 'AdvertisingExpenses',
		head: '広告宣伝費',
		indent: 1,
	},
	{
		key: 'salesCommission',
		head: '販売手数料',
		indent: 1,
	},
	{
		key: 'FBAShippingFeeRate',
		head: 'FBA配送手数料率',
		indent: 1,
	},
];

const bsTableWithTax: TableMetaData[] = [
	{
		key: 'unpaidBalance',
		head: '売掛金(未入金額)',
		indent: 1,
	},
	{
		key: 'inventoryAssets',
		head: '在庫資産',
		indent: 1,
	},
];

export default function Page() {
	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>PL/BS</h1>
			<Separator />
			<Table>
				<TableBody>
					<HeadTableRow>
						<TableCell>PL</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='pl_date' underLine={true}>
						<IndentTableCell />
						<TableCell>2024</TableCell>
					</PlbsTableRow>
					{plTableWithTax.map(item => (
						<PlbsTableRow
							key={item.key}
							underLine={item.underLine}
							doubleUnderLine={item.doubleUnderLine}
						>
							<IndentTableCell indent={item.indent}>
								{item.head}
							</IndentTableCell>
							<TableCell>100</TableCell>
						</PlbsTableRow>
					))}
				</TableBody>
			</Table>
			<Table>
				<TableBody>
					<HeadTableRow>
						<TableCell>指標</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='index_date' underLine={true}>
						<IndentTableCell />
						<TableCell>2024</TableCell>
					</PlbsTableRow>
					{indexTable.map(item => (
						<PlbsTableRow
							key={item.key}
							underLine={item.underLine}
							doubleUnderLine={item.doubleUnderLine}
						>
							<IndentTableCell indent={item.indent}>
								{item.head}
							</IndentTableCell>
							<TableCell>100</TableCell>
						</PlbsTableRow>
					))}
				</TableBody>
			</Table>
			<Table>
				<TableBody>
					<HeadTableRow>
						<TableCell>BS</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='bs_date' underLine={true}>
						<IndentTableCell />
						<TableCell>2024</TableCell>
					</PlbsTableRow>
					{bsTableWithTax.map(item => (
						<PlbsTableRow
							key={item.key}
							underLine={item.underLine}
							doubleUnderLine={item.doubleUnderLine}
						>
							<IndentTableCell indent={item.indent}>
								{item.head}
							</IndentTableCell>
							<TableCell>100</TableCell>
						</PlbsTableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
