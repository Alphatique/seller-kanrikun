'use client';

import { useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import useSWR from 'swr';
import * as XLSX from 'xlsx';

import { addCostPrices } from '@seller-kanrikun/data-operation/cost-price';
import { tsvObjToTsvGzip } from '@seller-kanrikun/data-operation/tsv-gzip';
import {
	type CostPrice,
	type CostPriceTsv,
	CostPriceTsvSchema,
	type UpdateCostPriceRequest,
} from '@seller-kanrikun/data-operation/types/cost-price';
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
import { fetchGunzipObjApi } from '~/lib/fetch-gunzip';

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
	// データ取得
	const { data: loadedData } = useSWR('/api/cost-price', async url => {
		const obj = await fetchGunzipObjApi<CostPriceTsv>(url);
		// dateが文字列でくるのでパース
		const validatedObj = obj.map(item => {
			return CostPriceTsvSchema.parse(item);
		});

		return validatedObj;
	});
	// 更新後のデータを保持するためにrefで保持
	const existData = useRef<CostPriceTsv[] | undefined>(loadedData);

	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});
	const [xlsxData, setXlsxData] = useState<CostPrice[] | undefined>();

	const handleUpload = async () => {
		// 既存データ、アップロードデータ、日付があるか確認
		if (!(existData.current && xlsxData && date && date.from && date.to))
			return;

		// 日付をUTCに変換
		const utcFrom = new Date(date.from.toISOString());
		const lastTimeOfTo = date.to.setHours(23, 59, 59, 999);
		const utcTo = new Date(lastTimeOfTo);

		const updateRequest: UpdateCostPriceRequest = {
			date: { from: utcFrom, to: utcTo },
			data: xlsxData,
		};
		const addedData = addCostPrices(existData.current, updateRequest);
		const tsvGzipped = tsvObjToTsvGzip(addedData);

		console.log('tsvGzipped:', addedData);

		const response = await fetch('/api/cost-price', {
			method: 'PUT',
			body: tsvGzipped,
		});

		if (!response.ok) {
			console.error('put Error:', response);
		} else {
			// 成功した場合、既存データを更新
			existData.current = addedData;
		}
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
