'use client';
import BarChart from '@seller-kanrikun/ui/components/bar-chart';
import LineChart from '@seller-kanrikun/ui/components/line-chart';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@seller-kanrikun/ui/components/select';
import { Separator } from '@seller-kanrikun/ui/components/separator';
import { DatePickerWithRange } from '~/components/date-range';
/*
export const metadata: Metadata = {
	title: 'セッション/CVR | セラー管理君',
};*/

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

export default function Page() {
	const [period, setPeriod] = useState<string>('monthly');
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>セッション/CVR</h1>
			<Separator />
			<DatePickerWithRange value={date} onValueChange={setDate} />
			<Select
				value={period}
				onValueChange={() => {
					setPeriod(period);
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
			</Select>{' '}
			<MultiSelect values={[{ key: 'henoheno', value: '3' }]} />
			<LineChart />
			<BarChart />
		</div>
	);
}

import { Button } from '@seller-kanrikun/ui/components/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@seller-kanrikun/ui/components/dropdown-menu';
interface ISelectProps {
	values: {
		key: string;
		value: string;
	}[];
}
const MultiSelect = ({ values }: ISelectProps) => {
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const handleSelectChange = (value: string) => {
		if (!selectedItems.includes(value)) {
			setSelectedItems(prev => [...prev, value]);
		} else {
			const referencedArray = [...selectedItems];
			const indexOfItemToBeRemoved = referencedArray.indexOf(value);
			referencedArray.splice(indexOfItemToBeRemoved, 1);
			setSelectedItems(referencedArray);
		}
	};

	const isOptionSelected = (value: string): boolean => {
		return selectedItems.includes(value);
	};
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='outline' className='flex gap-2 font-bold'>
						<span>Select Values</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className='w-56'
					onCloseAutoFocus={e => e.preventDefault()}
				>
					<DropdownMenuLabel>Appearance</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{values.map((value: ISelectProps['values'][0], index: number) => {
						return (
							<DropdownMenuCheckboxItem
								onSelect={e => e.preventDefault()}
								key={index.toString()}
								checked={isOptionSelected(value.key)}
								onCheckedChange={() => handleSelectChange(value.key)}
							>
								{value.value}
							</DropdownMenuCheckboxItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};
