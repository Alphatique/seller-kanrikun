import { Readable } from 'node:stream';
import csvParser from 'csv-parser';
import * as parquetjs from 'parquetjs';
import type { WritableStreamBuffer } from 'stream-buffers';
import * as streamBuffers from 'stream-buffers';

const schema = new parquetjs.ParquetSchema({
	settlement_id: { type: 'UTF8' },
	settlement_start_date: { type: 'UTF8' },
	settlement_end_date: { type: 'UTF8' },
	deposit_date: { type: 'UTF8' },
	total_amount: { type: 'DOUBLE' },
	currency: { type: 'UTF8' },
	transaction_type: { type: 'UTF8' },
	order_id: { type: 'UTF8' },
	merchant_order_id: { type: 'UTF8' },
});

//const csvData: string =
//	'settlement-id\tsettlement-start-date\tsettlement-end-date\tdeposit-date\ttotal-amount\tcurrency\ttransaction-type\torder-id\tmerchant-order-id\n11851320303\t2024-10-23T00:10:35+00:00\t2024-11-06T00:10:35+00:00\t2024-11-08T00:10:35+00:00\t303092.0\tJPY\tOrder\t250-2454249-1834216\t250-2454249-1834216';

export async function parquet(data: string) {
	const parquetBuffer = Buffer.alloc(0);
	const outputStream: WritableStreamBuffer =
		new streamBuffers.WritableStreamBuffer();
	const parquetTransformer = new parquetjs.ParquetTransformer(schema);

	// CSVデータをストリームに変換
	const stream = Readable.from(data);
	stream
		.pipe(csvParser({ separator: '\t' })) // タブ区切りのCSVを読み込む
		.on('data', row => {
			// Parquetに行を追加
			parquetTransformer.write({
				settlement_id: row['settlement-id'],
				settlement_start_date: row['settlement-start-date'],
				settlement_end_date: row['settlement-end-date'],
				deposit_date: row['deposit-date'],
				total_amount: Number.parseFloat(row['total-amount']) || 0,
				currency: row.currency,
				transaction_type: row['transaction-type'],
				order_id: row['order-id'],
				merchant_order_id: row['merchant-order-id'],
				// 他のフィールドも必要に応じて追加
			});

			console.log(row);
		})
		.on('end', () => {
			parquetTransformer.end();

			//console.log(parquetTransformer);
		});

	/*
		.on('end', async () => {
			parquetTransformer.end();
			parquetTransformer.pipe(outputStream).on('finish', () => {
				parquetBuffer = outputStream.getContents() || Buffer.alloc(0);
				console.log(parquetBuffer);
				console.log('Parquetデータが正常にメモリに格納されました。');
			});
		});*/

	console.log('parquet');
}
