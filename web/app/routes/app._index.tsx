import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import {
	Button,
	DateRangeInput,
	Label,
	PlbsTable,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui';
import {
	addDays,
	addMonths,
	addQuarters,
	addYears,
	endOfMonth,
	format,
	startOfMonth,
} from 'date-fns';

import type { DateCalcedPlbsData, Period } from '~/types';

import { useSession } from '@seller-kanrikun/auth/client';
import {
	getPlbsData,
	getRangedData,
	getSumPlbsData,
} from '@seller-kanrikun/calc';
import type {
	PlbsData,
	ReportDocumentRowJson,
} from '@seller-kanrikun/calc/types';

function calcDatas(data: ReportDocumentRowJson[]): DateCalcedPlbsData[] {
	const result: DateCalcedPlbsData[] = [];

	// 最初と最後の日付を取得
	let lastDate: Date | undefined = undefined;
	let firstDate: Date | undefined = undefined;
	for (const row of data) {
		const date: Date = new Date(row['posted-date']);
		if (date.toString() === 'Invalid Date') continue;
		if (!firstDate || date < firstDate) {
			firstDate = date;
		}
		if (!lastDate || date > lastDate) {
			lastDate = date;
		}
	}

	if (!firstDate || !lastDate) return result;

	// 月次でループ
	let current = firstDate;
	while (current < lastDate) {
		// データをフィルター
		const eachData = getRangedData(current, endOfMonth(current), data);

		// PLBSデータを計算
		const calc = getPlbsData(eachData);
		// 日にちごとにデータを格納
		result.push({
			date: current,
			data: calc,
		});

		current = getFirstDayOfNextMonth(current);
	}

	return result;
}

// 期間内の合計データを取得
function getRangedSumData(
	start: Date,
	end: Date,
	data: DateCalcedPlbsData[],
): PlbsData {
	const rangedCalcedData: PlbsData[] = data
		.filter(row => row.date >= start && row.date < end)
		.map(row => row.data);
	return getSumPlbsData(rangedCalcedData);
}

// 次の月の初日を取得
function getFirstDayOfNextMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export default function HomePage() {
	function recreateViewData(period: Period, range: DateRange) {
		if (!range?.from || !range?.to) return;
		// 新規リスト作成
		const newDateList: string[] = [];
		const newDataList: PlbsData[] = [];
		let current = startOfMonth(range.from);
		switch (period) {
			case 'monthly':
				// 月次でループ
				while (current <= range.to) {
					const next = addMonths(current, 1);
					newDateList.push(format(current, 'yyyy/MM'));
					newDataList.push(
						getRangedSumData(current, addDays(next, -1), calcedData),
					); // 一個しかない気もするけど、一応
					current = next;
				}
				break;
			case 'quarterly':
				// 四半期でループ
				while (current <= range.to) {
					const next = addQuarters(current, 1);
					newDateList.push(`${format(current, 'yyyy q')}Q`);
					newDataList.push(
						getRangedSumData(current, addDays(next, -1), calcedData),
					);
					current = next;
				}
				break;
			case 'yearly':
				// 年次でループ
				while (current <= range.to) {
					const next = addYears(current, 1);
					newDateList.push(format(current, 'yyyy'));
					newDataList.push(
						getRangedSumData(current, addDays(next, -1), calcedData),
					);
					current = next;
				}
				break;
		}
		console.log(calcedData, newDateList, newDataList);
		// 日付のリストをセット
		setTableDates(newDateList);
		// データのリストをセット
		setTableData(newDataList);
	}
	const [calcedData, setCalcedData] = useState<DateCalcedPlbsData[]>([]);

	const [date, setDate] = useState<DateRange>({
		from: new Date(),
		to: new Date(),
	});
	const [period, setPeriod] = useState<Period>('monthly');
	const [tableDates, setTableDates] = useState<string[]>([]);
	const [tableData, setTableData] = useState<PlbsData[]>([]);

	const { data: session } = useSession();

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (!session) return;
		const fetchData = async () => {
			const response = await fetch('/app/read-data', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain', // Textデータの指定
				},
				body: session.user.id,
			});
			const json: ReportDocumentRowJson[] = await response.json();
			const data = calcDatas(json);
			await setCalcedData(data);
			console.log(data);
			recreateViewData(period, date); // ここで初期化しちゃってるので、session以外入れると無限ループする。分離しろということかもしれない
		};
		fetchData();
	}, [session]); // sessionが変わったときだけ実行
	const onPeriodChangeHandler = (value: string) => {
		const newValue = value as Period;
		setPeriod(newValue);
		recreateViewData(newValue, date);
	};

	const onDateChangeHandler = (
		value: React.SetStateAction<DateRange | undefined>,
	) => {
		const newValue = value as DateRange;
		setDate(newValue);
		recreateViewData(period, newValue);
		console.log('date', newValue);
		console.log(calcedData);
	};

	return (
		<div className='grid gap-4'>
			<Label>Welcome to the Home Page!</Label>
			<div className='flex items-center justify-between'>
				<Select value={period} onValueChange={onPeriodChangeHandler}>
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
					<DateRangeInput value={date} onValueChange={onDateChangeHandler} />
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
			</Table>

			<PlbsTable
				title={'PL'}
				data={{
					date: { leftHead: '', indent: 0, values: tableDates },
					sales: {
						leftHead: '売上',
						indent: 0,
						values: tableData.map(data => data.sales),
					},
					principal: {
						leftHead: '商品代金',
						indent: 1,
						values: tableData.map(data => data.principal),
					},
					principalTax: {
						leftHead: '商品代金に対する税金',
						indent: 1,
						values: tableData.map(data => data.principalTax),
					},
					shipping: {
						leftHead: '配送料',
						indent: 1,
						values: tableData.map(data => data.shipping),
					},
					otherTax: {
						leftHead: 'その他税金',
						indent: 1,
						values: tableData.map(data => data.otherTax),
					},
					refund: {
						leftHead: '返品額',
						indent: 0,
						values: tableData.map(data => data.refund),
					},
					netSales: {
						leftHead: '純売上',
						indent: 0,
						values: tableData.map(data => data.netSales),
					},
					costPrice: {
						leftHead: '原価',
						indent: 0,
						values: tableData.map(data => data.costPrice),
					},
					grossProfit: {
						leftHead: '粗利益',
						indent: 0,
						values: tableData.map(data => data.grossProfit),
					},
					sga: {
						leftHead: '販売費および一般管理費',
						indent: 0,
						values: tableData.map(data => data.sga),
					},
					amazonAds: {
						leftHead: '広告宣伝費(Amazon広告)',
						indent: 1,
						values: tableData.map(data => data.amazonAds),
					},
					promotion: {
						leftHead: 'プロモーション費用',
						indent: 1,
						values: tableData.map(data => data.promotion),
					},
					salesCommission: {
						leftHead: '販売手数料',
						indent: 1,
						values: tableData.map(data => data.salesCommission),
					},
					fbaShippingFee: {
						leftHead: 'FBA配送手数料',
						indent: 1,
						values: tableData.map(data => data.fbaShippingFee),
					},
					inventoryStorageFee: {
						leftHead: '在庫保管料',
						indent: 1,
						values: tableData.map(data => data.inventoryStorageFee),
					},
					inventoryUpdateFee: {
						leftHead: '在庫更新費用',
						indent: 1,
						values: tableData.map(data => data.inventoryUpdateFee),
					},
					shippingReturnFee: {
						leftHead: '配送返戻金',
						indent: 1,
						values: tableData.map(data => data.shippingReturnFee),
					},
					subscriptionFee: {
						leftHead: 'アカウント月額登録料',
						indent: 1,
						values: tableData.map(data => data.subscriptionFee),
					},
					amazonOther: {
						leftHead: 'Amazonその他費用',
						indent: 0,
						values: tableData.map(data => data.amazonOther),
					},
					operatingProfit: {
						leftHead: '営業利益',
						indent: 0,
						values: tableData.map(data => data.operatingProfit),
					},
				}}
			/>
			<PlbsTable
				title={'BS'}
				data={{
					unpaidBalance: {
						leftHead: '売掛金(未入金額)',
						indent: 0,
						values: tableData.map(data => data.unpaidBalance),
					},
					inventoryAssets: {
						leftHead: '棚卸資産',
						indent: 0,
						values: tableData.map(data => data.inventoryAssets),
					},
				}}
			/>
		</div>
	);
}
