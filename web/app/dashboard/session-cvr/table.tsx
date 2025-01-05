import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

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
	selectData: keyof SessionCvrData;
	tableData: Record<string, number>[];
}

export function SessionTable({ selectData, tableData }: Props) {
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
				{tableData.map((data, index) => {
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
				})}
			</TableBody>
		</Table>
	);
}
