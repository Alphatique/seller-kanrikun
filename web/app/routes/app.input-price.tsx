import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import * as XLSX from 'xlsx';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	DateRangeInput,
	Input,
	Label,
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui';

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { CostPrice, UpdateCostPriceRequest } from '~/types';

import { useSession } from '@seller-kanrikun/auth/client';
import * as arrow from 'apache-arrow';
import * as parquetWasm from 'parquet-wasm';
import { getPriceWriteOnlySignedUrl } from '../r2.server';

async function read() {
	/*
	const parquetUint8Array = new Uint8Array(await resp.arrayBuffer());
	const arrowWasmTable = parquetWasm.readParquet(parquetUint8Array);
	const arrowTable = arrow.tableFromIPC(arrowWasmTable.intoIPCStream());
	const getedArray = arrowTable.toArray();

	const myData = {
		stringArray: ['heno', 'mohe'],
		intArray: [],
		doubleArray: [],
	};

	getedArray.push(myData);

	console.log(getedArray);*/
}

export async function action({ request, context }: ActionFunctionArgs) {
	const body: UpdateCostPriceRequest = await request.json();
	console.log(body);

	const ASINArray = [];
	const priceArray = [];
	const dateArray = [];

	const zeroFromDate = new Date(body.date.from);
	zeroFromDate.setUTCHours(0, 0, 0, 0);
	const zeroToDate = new Date(body.date.to);
	zeroToDate.setUTCHours(0, 0, 0, 0);

	for (
		let date = zeroFromDate;
		date <= zeroToDate;
		date.setDate(date.getDate() + 1)
	) {
		for (const { ASIN, Price } of body.data) {
			ASINArray.push(ASIN);
			priceArray.push(Price);
			dateArray.push(date);
		}
	}

	const table = arrow.tableFromArrays({
		ASIN: ASINArray,
		price: priceArray,
		date: dateArray,
	});

	const parquetTable = parquetWasm.Table.fromIPCStream(
		arrow.tableToIPC(table, 'stream'),
	);
	const writerProperties = new parquetWasm.WriterPropertiesBuilder()
		.setCompression(parquetWasm.Compression.SNAPPY)
		.build();
	const parquetUint8Array = parquetWasm.writeParquet(
		parquetTable,
		writerProperties,
	);
	console.log(parquetUint8Array);

	const writeUrl = await getPriceWriteOnlySignedUrl(body.userId);

	const writeResponse = await fetch(writeUrl, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/octet-stream',
		},
		body: parquetUint8Array,
	});

	console.log(writeResponse);

	return 'ok';
}

export default function HomePage() {
	const { data: session } = useSession();

	const [uploadDate, setUploadDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	const [tableDate, setTableDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});

	const [xlsxData, setlsxData] = useState<CostPrice[] | undefined>();

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.item(0);

		if (file) {
			const reader = new FileReader();
			reader.onload = event => {
				const binaryStr = event.target?.result;
				const workbook = XLSX.read(binaryStr, { type: 'binary' });
				const worksheet = workbook.Sheets[workbook.SheetNames[0]];
				const jsonData = XLSX.utils.sheet_to_json(worksheet);

				const data: CostPrice[] = [];
				for (const { ASIN, '原価(円)': Price } of jsonData.filter(
					(item): item is { ASIN: string; '原価(円)': number } =>
						typeof item === 'object' &&
						item !== null &&
						'ASIN' in item &&
						'原価(円)' in item &&
						typeof item.ASIN === 'string' &&
						typeof item['原価(円)'] === 'number',
				)) {
					data.push({ ASIN, Price });
				}

				if (jsonData.length !== 0) {
					setlsxData(data);
				}
				console.log(data);
			};
			reader.readAsBinaryString(file);
		}
	};

	const handleUpdate = () => {
		fetch('/app/input-price', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: session.user.id,
				date: uploadDate,
				data: xlsxData,
			}),
		})
			.then(response => response.json())
			.then(result => console.log(result))
			.catch(error => console.error('Error:', error));
	};

	return (
		<div className='grid gap-4'>
			<Label>Welcome to the input price!</Label>
			<div className='flex items-center justify-between'>
				<div className='grid w-auto max-w-sm items-center gap-1.5'>
					<Input
						id='upload'
						type='file'
						accept='.xls,.xlsx'
						className='hover:cursor-pointer'
						onChange={handleFileUpload}
					/>
				</div>
				<div className='flex items-center gap-2'>
					<DateRangeInput value={uploadDate} onValueChange={setUploadDate} />
					<Button onClick={handleUpdate}>Update</Button>
				</div>
			</div>

			{xlsxData ? (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ASIN</TableHead>
							<TableHead>原価(円)</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{xlsxData.map(({ ASIN, Price }) => (
							<TableRow key={ASIN}>
								<TableCell>{ASIN}</TableCell>
								<TableCell>{Price}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : null}
			<Accordion
				type='single'
				collapsible
				className='w-auto rounded-lg px-4 hover:bg-muted'
			>
				<AccordionItem value='item-1'>
					<AccordionTrigger>原価入力について</AccordionTrigger>
					<AccordionContent>
						<ul className='list-disc space-y-2 pl-5'>
							<li>
								<p>
									<a
										href='/template.xlsx'
										download='Seller管理くん-原価入力テンプレート.xlsx'
										className='text-blue-500 underline'
									>
										原価入力テンプレートのダウンロード
									</a>
								</p>
								<p>
									まずは、指定された商品の原価を入力するためのテンプレートをダウンロードしてください。このテンプレートには、あらかじめ商品名や商品番号が入力されていますので、ユーザーが入力するのは原価情報のみです。
								</p>
							</li>
							<li>
								<p>原価の入力</p>
								<p>
									ダウンロードしたテンプレートを開き、「原価(円)」の欄に各商品の原価を入力してください。
								</p>
							</li>
							<li>
								<p>原価入力後のアップロード</p>
								<p>
									保存したテンプレートをアップロードしてください。入力された原価情報が適用される反映期間（開始日と終了日）を設定し、「反映」ボタンをクリックしてください。入力された情報はPLBS画面等に反映されます。
								</p>
							</li>
						</ul>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<div className='flex gap-2'>
				<div className='flex items-center gap-2'>
					<Switch id='latest' />
					<Label htmlFor='latest'>最新</Label>
				</div>
				<DateRangeInput value={tableDate} onValueChange={setTableDate} />
				<div className='flex items-center'>
					<SearchIcon />
					<Input type='text' placeholder='ASIN' />
				</div>
				<Select>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='category' />
					</SelectTrigger>
					<SelectContent />
				</Select>
				<Select>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='sub category' />
					</SelectTrigger>
					<SelectContent />
				</Select>
				<Button>Download</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>商品名</TableHead>
						<TableHead>ASIN</TableHead>
						<TableHead>SKU</TableHead>
						<TableHead>適用開始日</TableHead>
						<TableHead>適用終了日</TableHead>
						<TableHead>原価(円)</TableHead>
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
		</div>
	);
}
