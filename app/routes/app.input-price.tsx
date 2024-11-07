import { format } from 'date-fns';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover';
import { cn } from '~/lib/utils';

enum Period {
	Monthly = 'Monthly',
	Quarterly = 'Quarterly',
	Yearly = 'Yearly',
}

import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/ui/accordion';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table';

export default function HomePage() {
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});

	return (
		<main>
			<Label>Welcome to the input price!</Label>
			<div className='grid w-full max-w-sm items-center gap-1.5'>
				<Label htmlFor='upload'>Choose file</Label>
				<Input id='upload' type='file' accept='.xls,.xlsx' />
			</div>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						id='date'
						variant={'outline'}
						className={cn(
							'w-[300px] justify-start text-left font-normal',
							!date && 'text-muted-foreground',
						)}
					>
						<CalendarIcon />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, 'LLL dd, y')} -{' '}
									{format(date.to, 'LLL dd, y')}
								</>
							) : (
								format(date.from, 'LLL dd, y')
							)
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-aut p-0' align='start'>
					<Calendar
						mode='range'
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={1}
					/>
				</PopoverContent>
			</Popover>
			<Button>Update</Button>

			<Accordion type='single' collapsible className='w-full'>
				<AccordionItem value='item-1'>
					<AccordionTrigger>原価入力について</AccordionTrigger>
					<AccordionContent>
						原価入力テンプレートのダウンロード
						まずは、指定された商品の原価を入力するためのテンプレートをダウンロードしてください。
						このテンプレートには、あらかじめ商品名や商品番号が入力されていますので、ユーザーが入力するのは原価情報のみです。
						原価の入力
						ダウンロードしたテンプレートを開き、「原価(円)」の欄に各商品の原価を入力してください。
						原価の入力
						入力された原価情報が適用される反映期間（開始日と終了日）を設定し、「反映」ボタンをクリックしてください。
						原価入力後のアップロード
						保存したテンプレートをアップロードしてください。入力された情報はPL
						BS画面等に反映されます。
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>項目</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>項目1</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>項目2</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</main>
	);
}
