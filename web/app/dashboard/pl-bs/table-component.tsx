import * as React from 'react';

import { cn } from '@seller-kanrikun/ui/lib/utils';

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

interface IndentTableRowProps
	extends React.HTMLAttributes<HTMLTableRowElement> {
	underLine?: boolean;
	doubleUnderLine?: boolean;
}

const PlbsTableRow = React.forwardRef<HTMLTableRowElement, IndentTableRowProps>(
	(
		{ className, underLine = false, doubleUnderLine = false, ...props },
		ref,
	) => (
		<tr
			ref={ref}
			className={cn(
				'text-right',
				'transition-colors hover:bg-muted/50',
				'[&_td:first-child]:border-r-4',
				underLine && 'border-black border-b-2',
				doubleUnderLine && 'border-black border-b-4 border-double',
				className,
			)}
			{...props}
		/>
	),
);
PlbsTableRow.displayName = 'PlbsTableRow';

interface IndentTableCellProps
	extends React.TdHTMLAttributes<HTMLTableCellElement> {
	indent?: number;
}

const IndentTableCell = React.forwardRef<
	HTMLTableCellElement,
	IndentTableCellProps
>(({ className, indent = 0, ...props }, ref) => (
	<td
		ref={ref}
		className={cn('w-60 p-2 text-left', className)}
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

export { DateTableRow, HeadTableRow, IndentTableCell, PlbsTableRow };
