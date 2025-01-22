import { Button } from '@seller-kanrikun/ui/components/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@seller-kanrikun/ui/components/dropdown-menu';

interface ISelectProps {
	values: {
		key: string;
		value: string;
	}[];
}

interface MultiSelectProps {
	values: Record<string, string>;
	selects: string[];
	onSelectChange: (value: string[]) => void;
}

export function MultiSelect({
	values,
	selects,
	onSelectChange,
}: MultiSelectProps) {
	const handleSelectChange = (value: string) => {
		const result = [...selects];
		if (!result.includes(value)) {
			result.push(value);
		} else {
			const indexOfItemToBeRemoved = result.indexOf(value);
			result.splice(indexOfItemToBeRemoved, 1);
		}

		onSelectChange(result);
	};

	const handleSelectAll = () => {
		const result = Object.keys(values);
		onSelectChange(result);
	};

	const handleClearAll = () => {
		onSelectChange([]);
	};

	const isOptionSelected = (value: string): boolean => {
		return selects.includes(value);
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline' className='flex gap-2 font-bold'>
					{selects.length === 0 ? (
						<span>Select Values</span>
					) : (
						<span>
							{selects.length} item
							{selects.length === 1 ? '' : 's'} selected
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-56'
				onCloseAutoFocus={e => e.preventDefault()}
			>
				<Button onClick={handleSelectAll}>すべて選択</Button>
				<Button onClick={handleClearAll}>クリア</Button>
				{Object.entries(values).map(([key, value], index) => {
					return (
						<DropdownMenuCheckboxItem
							onSelect={e => e.preventDefault()}
							key={index.toString()}
							checked={isOptionSelected(key)}
							onCheckedChange={() => handleSelectChange(key)}
						>
							{value}
						</DropdownMenuCheckboxItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
