import type * as arrow from 'apache-arrow';

import {
	Table,
	TableBody,
	TableCell,
} from '@seller-kanrikun/ui/components/table';

import { HeadTableRow, IndentTableCell, PlbsTableRow } from './table-component';
import {
	bsTableWithTax,
	bsTableWithoutTax,
	plTableWithTax,
	plTableWithoutTax,
} from './table-meta';

interface Props {
	withTax: boolean;
	groupedDataIndexes: Record<string, number[]>;
	filteredReport: arrow.Table | null;
	plbsWithTax: arrow.Table | null;
	plbsWithoutTax: arrow.Table | null;
}

export function PlbsTable({
	withTax,
	groupedDataIndexes,
	filteredReport,
	plbsWithTax,
	plbsWithoutTax,
}: Props) {
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
					{(withTax ? plTableWithTax : plTableWithoutTax).map(
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
										let child = filteredReport?.getChild(
											item.key,
										);
										if (
											child === null ||
											child === undefined
										) {
											child = withTax
												? plbsWithTax?.getChild(
														item.key,
													)
												: plbsWithoutTax?.getChild(
														item.key,
													);
										}
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
						<TableCell>2024</TableCell>
					</PlbsTableRow>
					{(withTax ? bsTableWithTax : bsTableWithoutTax).map(
						item => (
							<PlbsTableRow
								key={item.key}
								underLine={item.underLine}
								doubleUnderLine={item.doubleUnderLine}
							>
								<IndentTableCell indent={item.indent}>
									{item.head}
								</IndentTableCell>
								{
									<TableCell>
										{withTax
											? plbsWithTax
													?.getChild(item.key)
													?.get(0)
											: plbsWithoutTax
													?.getChild(item.key)
													?.get(0)}
									</TableCell>
								}
							</PlbsTableRow>
						),
					)}
				</TableBody>
			</Table>
		</>
	);
}
