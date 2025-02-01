import type { Schema } from 'zod';

import {
	jsonGzipArrayToJsonObj,
	jsonGzipArrayToJsonStr,
	jsonObjToJsonGzipArray,
} from '@seller-kanrikun/data-operation/json-gzip';
import { putFile } from '@seller-kanrikun/data-operation/r2';
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
	const tsvStr = jsonGzipArrayToJsonStr(uint8Array);
	return tsvStr;
}

export async function gzipAndPutFile(
	userId: string,
	fileName: string,
	data: object,
) {
	const gzippedArray = jsonObjToJsonGzipArray(data);

	const putResult = await putFile(userId, fileName, gzippedArray);
	return !(putResult === undefined);
}
