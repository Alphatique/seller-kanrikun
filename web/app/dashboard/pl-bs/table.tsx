import type * as arrow from 'apache-arrow';

import {
	Table,
	TableBody,
	TableCell,
} from '@seller-kanrikun/ui/components/table';

import { HeadTableRow, IndentTableCell, PlbsTableRow } from './table-component';
import {
	bsTableWithTaxInfo,
	bsTableWithoutTax,
	plTableWithTaxInfo,
	plTableWithoutTaxInfo,
} from './table-meta';

interface Props {
	withTax: boolean;
	groupedDataIndexes: Record<string, number[]>;
	filteredReport: arrow.Table | null;
	plbsDataWithTax: arrow.Table | null;
	plbsDataWithoutTax: arrow.Table | null;
}

export function PlbsTable({
	withTax,
	groupedDataIndexes,
	filteredReport,
	plbsDataWithTax,
	plbsDataWithoutTax,
}: Props) {
	// フラグに沿ってplbsDataを選択
	const plbsData = withTax ? plbsDataWithTax : plbsDataWithoutTax;
	return (
		<>
			<Table>
				<TableBody>
					<HeadTableRow>
						<TableCell>PL</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='pl_date' underLine={true}>
						<IndentTableCell />
						{Object.entries(groupedDataIndexes).map(([key]) => {
							return (
								<TableCell key={`pl_date_${key}`}>
									{key}
								</TableCell>
							);
						})}
					</PlbsTableRow>
					{(withTax ? plTableWithTaxInfo : plTableWithoutTaxInfo).map(
						item => (
							<PlbsTableRow
								key={item.key}
								underLine={item.underLine}
								doubleUnderLine={item.doubleUnderLine}
							>
								<IndentTableCell indent={item.indent}>
									{item.head}
								</IndentTableCell>
								{Object.entries(groupedDataIndexes).map(
									([date, values]) => {
										// レポートデータかplbsDataかどちらかを取得
										const child =
											filteredReport?.getChild(
												item.key,
											) ?? plbsData?.getChild(item.key);
										// グルーピングされたデータの合計を取得
										const sumValue = values.reduce(
											(sum, index) =>
												sum + child?.get(index),
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
						),
					)}
				</TableBody>
			</Table>
			<Table>
				<TableBody>
					<HeadTableRow>
						<TableCell>BS</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='bs_date' underLine={true}>
						<IndentTableCell />
						{Object.entries(groupedDataIndexes).map(([key]) => {
							return (
								<TableCell key={`bs_date_${key}`}>
									{key}
								</TableCell>
							);
						})}
					</PlbsTableRow>
					{(withTax ? bsTableWithTaxInfo : bsTableWithoutTax).map(
						item => (
							<PlbsTableRow
								key={item.key}
								underLine={item.underLine}
								doubleUnderLine={item.doubleUnderLine}
							>
								<IndentTableCell indent={item.indent}>
									{item.head}
								</IndentTableCell>
								{Object.entries(groupedDataIndexes).map(
									([date, values]) => {
										const child =
											filteredReport?.getChild(
												item.key,
											) ?? plbsData?.getChild(item.key);
										const sumValue = values.reduce(
											(sum, index) =>
												sum + child?.get(index),
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
						),
					)}
				</TableBody>
			</Table>
		</>
	);
}
