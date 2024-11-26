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

const data = [
	[3500, 3500, 3500, 3500, 3500, 3500, 3500, 3500],
	[500, 500, 500, 500, 500, 500, 500, 500],
	[500, 500, 500, 500, 500, 500, 500, 500],
	[500, 500, 500, 500, 500, 500, 500, 500],
	[500, 500, 500, 500, 500, 500, 500, 500],
	[1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500],
	[300, 300, 300, 300, 300, 300, 300, 300],
	[3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200],
	[400, 400, 400, 400, 400, 400, 400, 400],
	[2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800],
	// 販売費および一般管理費
	[3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200],
	[400, 400, 400, 400, 400, 400, 400, 400],
	[400, 400, 400, 400, 400, 400, 400, 400],
	[400, 400, 400, 400, 400, 400, 400, 400],
	[400, 400, 400, 400, 400, 400, 400, 400],
	[400, 400, 400, 400, 400, 400, 400, 400],
	[400, 400, 400, 400, 400, 400, 400, 400],
	[400, 400, 400, 400, 400, 400, 400, 400],
	[400, 400, 400, 400, 400, 400, 400, 400],
	// amazonその他
	[500, 500, 500, 500, 500, 500, 500, 500],
	// 営業利益
	[-400, -400, -400, -400, -400, -400, -400, -400],

	// BS
	[30, 30, 30, 30, 30, 30, 30, 30],
	[1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000],
];

import { useSession } from '@seller-kanrikun/auth/client';
import type { ReportDocumentRowJson } from '@seller-kanrikun/data-operation/types';

export default function HomePage() {
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	const [period, setPeriod] = useState<Period>('monthly');

	const { data: session } = useSession();

	if (session) {
		fetch('/app/read-data', {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain', // Textデータの指定
			},
			body: session.user.id,
		})
			.then(async response => {
				console.log(response);
				const json: ReportDocumentRowJson[] = await response.json();
				console.log(json);
			})
			.catch(error => console.error('Error:', error));
	}

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
						{period === 'monthly' ? (
							<>
								<TableCell>2024/02</TableCell>
								<TableCell>2024/03</TableCell>
								<TableCell>2024/04</TableCell>
								<TableCell>2024/05</TableCell>
								<TableCell>2024/06</TableCell>
								<TableCell>2024/07</TableCell>
								<TableCell>2024/08</TableCell>
								<TableCell>2024/09</TableCell>
							</>
						) : period === 'quarterly' ? (
							<>
								<TableCell>2023Q1</TableCell>
								<TableCell>2023Q2</TableCell>
								<TableCell>2023Q3</TableCell>
								<TableCell>2023Q4</TableCell>
								<TableCell>2024Q1</TableCell>
								<TableCell>2024Q2</TableCell>
								<TableCell>2024Q3</TableCell>
								<TableCell>2024Q4</TableCell>
							</>
						) : (
							<>
								<TableCell>2023</TableCell>
								<TableCell>2024</TableCell>
							</>
						)}
					</DateTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>売上</IndentableTableCell>
						{data[0].map((row, i) => (
							<TableCell key={`sells_amount${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>商品代金</IndentableTableCell>
						{data[1].map((row, i) => (
							<TableCell key={`product_price${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							商品代金に対する税金
						</IndentableTableCell>
						{data[2].map((row, i) => (
							<TableCell key={`product_price_tax${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>配送料</IndentableTableCell>
						{data[3].map((row, i) => (
							<TableCell key={`delivery_fee${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							配送料に対する税金
						</IndentableTableCell>
						{data[4].map((row, i) => (
							<TableCell key={`delivery_fee_tax${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>その他税金</IndentableTableCell>
						{data[5].map((row, i) => (
							<TableCell key={`other_taxes${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>返品額</IndentableTableCell>
						{data[6].map((row, i) => (
							<TableCell key={`return_amount${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>純売上</IndentableTableCell>
						{data[7].map((row, i) => (
							<TableCell key={`net_sales${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>原価</IndentableTableCell>
						{data[8].map((row, i) => (
							<TableCell key={`cost${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>粗利益</IndentableTableCell>
						{data[9].map((row, i) => (
							<TableCell key={`gross_profit${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>
							販売費および一般管理費
						</IndentableTableCell>
						{data[10].map((row, i) => (
							<TableCell
								key={`sales_and_general_management_expenses${i.toString()}`}
							>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							広告宣伝費（Amazon広告）
						</IndentableTableCell>
						{data[11].map((row, i) => (
							<TableCell key={`advertising_expenses${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							プロモーション費用
						</IndentableTableCell>
						{data[12].map((row, i) => (
							<TableCell key={`promotion_expenses${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>販売手数料</IndentableTableCell>
						{data[13].map((row, i) => (
							<TableCell key={`sales_commission${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>FBA出荷手数料</IndentableTableCell>
						{data[14].map((row, i) => (
							<TableCell key={`fba_shipping_fee${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>在庫保管料</IndentableTableCell>
						{data[15].map((row, i) => (
							<TableCell key={`inventory_storage_fee${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>在庫更新費用</IndentableTableCell>
						{data[16].map((row, i) => (
							<TableCell key={`inventory_update_fee${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>配送返戻金</IndentableTableCell>
						{data[17].map((row, i) => (
							<TableCell key={`shipping_return_fee${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={2}>
							アカウント月額登録料
						</IndentableTableCell>
						{data[18].map((row, i) => (
							<TableCell
								key={`account_monthly_registration_fee${i.toString()}`}
							>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>amazonその他</IndentableTableCell>
						{data[19].map((row, i) => (
							<TableCell key={`amazon_other${i.toString()}`}>{row}</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>営業利益</IndentableTableCell>
						{data[20].map((row, i) => (
							<TableCell key={`perpetual_profit${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<HeadTableRow>
						<TableCell>BS</TableCell>
					</HeadTableRow>
					<DateTableRow>
						<IndentableTableCell />
					</DateTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>
							売掛金（未入金額）
						</IndentableTableCell>
						{data[21].map((row, i) => (
							<TableCell key={`accounts_receivable${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
					<PLBSTableRow>
						<IndentableTableCell indent={1}>棚卸資産</IndentableTableCell>
						{data[22].map((row, i) => (
							<TableCell key={`inventory_assets${i.toString()}`}>
								{row}
							</TableCell>
						))}
					</PLBSTableRow>
				</TableBody>
			</Table>
		</div>
	);
}
