import type {
	FilteredSettlementReport,
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
	groupedDataIndexes: Record<string, number[]>;
	filteredReport: FilteredSettlementReport[] | undefined;
	plbsDataWithTax: PlBsWithTax[] | undefined;
	plbsDataWithoutTax: PlBsWithoutTax[] | undefined;
}

function getNumericValue<T extends object>(
	data: T[] | undefined,
	index: number,
	key: keyof T,
): number {
	if (!data) return 0;
	const row = data[index];
	if (!row) return 0;
	const val = row[key];
	return typeof val === 'number' ? val : 0;
}

export function PlbsTable({
	title,
	tableInfo,
	groupedDataIndexes,
	filteredReport,
	plbsDataWithTax,
	plbsDataWithoutTax,
}: Props) {
	// フラグに沿ってplbsDataを選択
	return (
		<>
			<Table>
				<TableBody>
					<HeadTableRow>
						<TableCell>{title}</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='pl_date' underLine={true}>
						<TableCell />
						{Object.entries(groupedDataIndexes).map(([key]) => {
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
							{Object.entries(groupedDataIndexes).map(
								([date, indexes]) => {
									// sumValueを算出
									// 各インデックスについて、3つのデータソースから値を合計
									const sumValue = indexes.reduce(
										(acc, idx) => {
											return (
												acc +
												getNumericValue(
													filteredReport,
													idx,
													item.key as keyof FilteredSettlementReport,
												) +
												getNumericValue(
													plbsDataWithTax,
													idx,
													item.key as keyof PlBsWithTax,
												) +
												getNumericValue(
													plbsDataWithoutTax,
													idx,
													item.key as keyof PlBsWithoutTax,
												)
											);
										},
										0,
									);

									return (
										<TableCell
											key={`pl_${item.key}_${date}`}
										>
											{sumValue}
										</TableCell>
									);
								},
							)}
						</PlbsTableRow>
					))}
				</TableBody>
			</Table>
		</>
	);
}
