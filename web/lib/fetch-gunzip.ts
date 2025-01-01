import {
	tsvGzipToTsvObj,
	tsvGzipToTsvStr,
} from '@seller-kanrikun/data-operation/tsv-gzip';

export async function fetchGunzipStrApi(url: string) {
	// データ取得
	const response = await fetch(url);
	// arrayBuffer(gzip)→uint8Array(gzip)→tsvStr(no gzi)に変換
	const tsvGzip = await response.arrayBuffer();
	const uint8Array = new Uint8Array(tsvGzip);
	const tsvStr = tsvGzipToTsvStr(uint8Array);
	return tsvStr;
}

export async function fetchGunzipObjApi<T>(url: string): Promise<T[]> {
	// データ取得
	const response = await fetch(url);
	// arrayBuffer(gzip)→uint8Array(gzip)→tsvStr(no gzi)に変換
	const tsvGzip = await response.arrayBuffer();
	const uint8Array = new Uint8Array(tsvGzip);
	const result = tsvGzipToTsvObj<T>(uint8Array);
	const data = result.data;
	return data;
}
