import * as React from 'react';

import { cn } from '../lib/utils';
import { Table, TableBody, TableCell } from './table';

const HeadTableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn('border-gray-500 border-b-4', className)}
		{...props}
	/>
));
HeadTableRow.displayName = 'HeadTableRow';

const DateTableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			'border-b-4 text-center',
			'[&_td:first-child]:border-r-4',
			className,
		)}
		{...props}
	/>
));
DateTableRow.displayName = 'DateTableRow';

const PlbsTableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			'text-right',
			'transition-colors hover:bg-muted/50',
			'[&_td:first-child]:border-r-4',
			className,
		)}
		{...props}
	/>
));
PlbsTableRow.displayName = 'PlbsTableRow';

interface IndentableTableCellProps
	extends React.TdHTMLAttributes<HTMLTableCellElement> {
	indent?: number;
}

const IndentableTableCell = React.forwardRef<
	HTMLTableCellElement,
	IndentableTableCellProps
>(({ className, indent = 0, ...props }, ref) => (
	<td
		ref={ref}
		className={cn('p-2 text-left', className)}
		style={{ paddingLeft: `${indent * 1 + 0.5}rem` }}
		{...props}
	/>
));

interface PlbsTableInputProps extends React.HTMLAttributes<HTMLElement> {
	title: string;
	data: {
		[key: string]: {
			leftHead: string;
			indent: number;
			values: (number | string)[];
		};
	};
}

const PlbsTable = ({ title, data }: PlbsTableInputProps) => {
	return (
		<Table>
			<TableBody>
				<HeadTableRow>
					<TableCell>{title}</TableCell>
				</HeadTableRow>
				{Object.entries(data).map(([key, value]) => (
					<PlbsTableRow key={`${key}+Row`}>
						<IndentableTableCell indent={value.indent}>
							{value.leftHead}
						</IndentableTableCell>
						{value.values.map((row, i) => (
							<TableCell key={`${key}${i.toString()}`}>{row}</TableCell>
						))}
					</PlbsTableRow>
				))}
			</TableBody>
		</Table>
	);
};

export {
	DateTableRow,
	HeadTableRow,
	IndentableTableCell,
	PlbsTable,
	PlbsTableRow,
};
