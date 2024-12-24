'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';

import { useSession } from '@seller-kanrikun/auth/client';
import type { CostPrice } from '@seller-kanrikun/data-operation/types/cost';
import { Button } from '@seller-kanrikun/ui/components/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import { DatePickerWithRange } from '~/components/date-range';
import { InputExcel } from '~/components/input-excel';

const fileToBinaryString = (file: File): Promise<ArrayBuffer> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = event => {
			if (event.target?.result) {
				// ArrayBufferを文字列に変換
				const binaryStr = event.target.result as ArrayBuffer;
				resolve(binaryStr);
			} else {
				reject(new Error('File read failed.'));
			}
		};
		reader.onerror = () => reject(new Error('File read error.'));
		reader.readAsArrayBuffer(file);
	});
};

const parseXlsxData = (binaryStr: ArrayBuffer): CostPrice[] => {
	const workbook = XLSX.read(binaryStr, { type: 'binary' });
	const worksheet = workbook.Sheets[workbook.SheetNames[0]];
	const jsonData = XLSX.utils.sheet_to_json<{
		ASIN: string;
		'原価(円)': number;
	}>(worksheet);

	return jsonData
		.filter(
			item =>
				typeof item?.ASIN === 'string' &&
				typeof item['原価(円)'] === 'number',
		)
		.map(({ ASIN, '原価(円)': Price }) => ({ ASIN, Price }));
};

export function InputPriceUpload() {
	const { data: session } = useSession();
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});

	const [xlsxData, setXlsxData] = useState<CostPrice[] | undefined>();

	const handleUpload = async () => {
		if (!session || !xlsxData || !date || !date.from || !date.to) return;
		const utcFrom = new Date(date.from.toISOString());
		const lastTimeOfTo = date.to.setHours(23, 59, 59, 999);
		const utcTo = new Date(lastTimeOfTo);
		const response = await fetch('/api/cost-price', {
			method: 'POST',
			headers: {
				'x-seller-kanrikun-session-id': session.session.id.toString(),
			},
			body: JSON.stringify({
				start: utcFrom,
				end: utcTo,
				values: xlsxData,
			}),
		});
		console.log(response);
		console.log(await response.text());
	};
	const handleFileChanged = async (file: File | null) => {
		if (!file) {
			setXlsxData(undefined);
			return;
		}
		try {
			const binaryStr = await fileToBinaryString(file);
			const data = parseXlsxData(binaryStr);
			setXlsxData(data);
		} catch (error) {
			console.error('Error processing file:', error);
			setXlsxData(undefined);
		}
	};

	return (
		<div className='grid gap-3'>
			<h2 className='font-bold text-2xl'>アップロード</h2>

			<div className='flex items-center justify-between'>
				<InputExcel onFileChange={handleFileChanged} />
				<div className='flex'>
					<DatePickerWithRange value={date} onValueChange={setDate} />
					<Button onClick={handleUpload}>Update</Button>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ASIN</TableHead>
						<TableHead>原価(円)</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{xlsxData?.map(({ ASIN, Price }) => (
						<TableRow key={ASIN}>
							<TableCell>{ASIN}</TableCell>
							<TableCell>{Price}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className=' my-3 w-full text-center text-muted-foreground leading-tight'>
				{xlsxData?.length === 0 && 'データがありません'}
				{xlsxData === undefined && '正しいファイルが選択されていません'}
			</div>
		</div>
	);
}
