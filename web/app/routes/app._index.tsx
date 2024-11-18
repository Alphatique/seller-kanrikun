import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import {
	Button,
	DateRangeInput,
	DateTableRow,
	HeadTableRow,
	IndentableTableCell,
	Label,
	PLBSTableRow,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui';

import type { Period } from '~/types';

export default function HomePage() {
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	const [period, setPeriod] = useState<Period>('monthly');

	return (
		<div className='grid gap-4'>
			<Label>Welcome to the Home Page!</Label>
			<div className='flex items-center justify-between'>
				<Select
					value={period}
					onValueChange={period => setPeriod(period as Period)}
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
				<div className='flex items-center gap-2'>
					<DateRangeInput value={date} onValueChange={setDate} />
					<Button>Submit</Button>
					<Button>Download</Button>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>項目</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<HeadTableRow>
						<TableCell>PL</TableCell>
					</HeadTableRow>
					<DateTableRow>
						<IndentableTableCell />
						<TableCell>2024/02</TableCell>
						<TableCell>2024/03</TableCell>
					</DateTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>売上</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>商品代金</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							商品代金に対する税金
						</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>配送料</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							配送料に対する税金
						</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>その他税金</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>返品額</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>純売上</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>原価</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>粗利益</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>
							販売費および一般管理費
						</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							広告宣伝費（Amazon広告）
						</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							プロモーション費用
						</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>販売手数料</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>FBA出荷手数料</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>在庫保管料</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>在庫更新費用</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>配送返戻金</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							アカウント月額登録料
						</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>amazonその他</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>永劫利益</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<HeadTableRow>
						<TableCell>BS</TableCell>
					</HeadTableRow>
					<DateTableRow>
						<IndentableTableCell />
						<TableCell>2024/02</TableCell>
						<TableCell>2024/03</TableCell>
					</DateTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>
							売掛金（未入金額）
						</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>棚卸資産</IndentableTableCell>
						<TableCell>¥100,000</TableCell>
						<TableCell>¥100,000</TableCell>
					</PLBSTableRow>
				</TableBody>
			</Table>
		</div>
	);
}
