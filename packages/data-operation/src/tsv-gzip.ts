import { gunzipSync, gzipSync } from 'fflate';
import Papa from 'papaparse';

export function tsvGzipToTsvObj<T>(tsvGzip: Uint8Array): Papa.ParseResult<T> {
	const trimText = tsvGzipToTsvStr(tsvGzip);

	return Papa.parse<T>(trimText, {
		header: true,
		delimiter: '\t',
		skipEmptyLines: true,
	});
}

export function tsvGzipToTsvStr(tsvGzip: Uint8Array): string {
	const decompressed = gunzipSync(tsvGzip);
	const decoder = new TextDecoder();
	const tsvText = decoder.decode(decompressed);
	const trimText = tsvText.trim();

	return trimText;
}

export function tsvObjToTsvGzip<T>(tsv: T[]): Uint8Array {
	const tsvText = Papa.unparse(tsv, {
		header: true,
		delimiter: '\t',
	}).trim();
	const encoder = new TextEncoder();
	const tsvArray = encoder.encode(tsvText);
	const compressed = gzipSync(tsvArray);

	return compressed;
}
