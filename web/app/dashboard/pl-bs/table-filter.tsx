'use client';
import { useState } from 'react';

import { Label } from '@seller-kanrikun/ui/components/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';
import { Switch } from '@seller-kanrikun/ui/components/switch';
import {
	Table,
	TableBody,
	TableCell,
} from '@seller-kanrikun/ui/components/table';

import { PopoverMonthRangePicker } from '~/components/popover-month-range-picker';

import {
	bsTableWithTax,
	bsTableWithoutTax,
	indexTable,
	plTableWithTax,
	plTableWithoutTax,
} from './table-meta';
import { HeadTableRow, IndentTableCell, PlbsTableRow } from './table-pl-bs';

export async function PlbsTableFilter() {
	const [period, setPeriod] = useState<Period>('monthly');
	const [date, setDate] = useState<{ start: Date; end: Date }>({
		start: new Date(),
		end: new Date(),
	});

	const [withTax, setWithTax] = useState(true);

	return (
		<div className='grid gap-3'>
			<div className='flex justify-start gap-3 align-center'>
				<Select
					value={period}
					onValueChange={(value: Period) => {
						setPeriod(value);
					}}
				>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='period' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='monthly'>Monthly</SelectItem>
						<SelectItem value='quarterly'>Quarterly</SelectItem>
						<SelectItem value='yearly'>Yearly</SelectItem>
					</SelectContent>
				</Select>
				<div className='flex items-center space-x-2'>
					<Switch
						id='airplane-mode'
						checked={withTax}
						onCheckedChange={setWithTax}
					/>
					<Label htmlFor='airplane-mode'>Without Tax</Label>
				</div>
				<PopoverMonthRangePicker
					value={date}
					onMonthRangeSelect={setDate}
				/>
			</div>

			<Table>
				<TableBody>
					<HeadTableRow>
						<TableCell>PL</TableCell>
					</HeadTableRow>
					<PlbsTableRow key='pl_date' underLine={true}>
						<IndentTableCell />
						<TableCell>2024</TableCell>
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
								<TableCell>100</TableCell>
							</PlbsTableRow>
						),
					)}
				</TableBody>
			</Table>
			{withTax && (
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
			)}

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
								<TableCell>100</TableCell>
							</PlbsTableRow>
						),
					)}
				</TableBody>
			</Table>
		</div>
	);
}
