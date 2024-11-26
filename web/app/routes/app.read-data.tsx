import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import duckdb from 'duckdb';
import { getReadOnlySignedUrl } from '../r2.server';
const db = new duckdb.Database(':memory:');

export async function action({ request, context }: ActionFunctionArgs) {
	console.log(request);
	const userId = await request.text(); // テキスト形式で取得

	console.log(`userId: ${userId}`);
	const readUrl = await getReadOnlySignedUrl(userId, 'price.parquet');
	/*
    const response = await fetch(readUrl);

	console.log(response);

	const parquetUint8Array = await response.arrayBuffer();

	console.log(parquetUint8Array);
*/
	console.log(readUrl);

	db.all(`SELECT * FROM read_parquet('${readUrl}');`, (err, result) => {
		if (err) {
			console.error(err);
		}
		console.log(result);
	});

	return 'he';
}
