import * as React from 'react';

import { cn } from '../lib/utils';

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

const PLBSTableRow = React.forwardRef<
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
PLBSTableRow.displayName = 'PLBSTableRow';

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

export { DateTableRow, HeadTableRow, IndentableTableCell, PLBSTableRow };
