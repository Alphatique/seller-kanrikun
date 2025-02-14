import type {
	FormatedSettlementReport,
	PlBsWithTax,
	PlBsWithoutTax,
} from '@seller-kanrikun/data-operation/types/pl-bs';
import {
	Table,
	TableBody,
	TableCell,
} from '@seller-kanrikun/ui/components/table';

import { HeadTableRow, IndentTableCell, PlbsTableRow } from './table-component';
import type { PlbsTableMetaData } from './table-meta';

interface Props {
	title: string;
	tableInfo: PlbsTableMetaData[];
	tableData: Record<string, Record<string, number>>;
}

export function PlbsTable({ title, tableInfo, tableData }: Props) {
	// フラグに沿ってplbsDataを選択
	return tableData ? (
		<>
			<Table>
				<TableBody>
					<HeadTableRow>
						<TableCell>{title}</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='pl_date' underLine={true}>
						<TableCell />
						{Object.keys(tableData).map(key => {
							console.log(
								key,
								`pl_date_${key}`,
								Object.keys(tableData),
							);
							return (
								<TableCell key={`pl_date_${key}`}>
									{key}
								</TableCell>
							);
						})}
					</PlbsTableRow>
					{tableInfo.map(item => (
						<PlbsTableRow
							key={item.key}
							underLine={item.underLine}
							doubleUnderLine={item.doubleUnderLine}
						>
							<IndentTableCell indent={item.indent}>
								{item.head}
							</IndentTableCell>
							{/* 日付ごとのセル */}
							{Object.entries(tableData).map(([date, data]) => {
								console.log(
									date,
									data,
									`pl_${item.key}_${date}`,
								);
								return (
									<TableCell key={`pl_${item.key}_${date}`}>
										{data[item.key].toLocaleString()}
									</TableCell>
								);
							})}
						</PlbsTableRow>
					))}
				</TableBody>
			</Table>
		</>
	) : (
		<></>
	);
}
