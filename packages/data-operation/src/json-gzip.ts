import { gunzipSync, gzipSync } from 'fflate';
import Papa from 'papaparse';
import type { Schema, infer, z } from 'zod';

export function jsonGzipArrayToJsonObj<TSchema extends Schema>(
	jsonGzipArray: Uint8Array,
	jsonSchema: TSchema,
) {
	const jsonStr = jsonGzipArrayToJsonStr(jsonGzipArray);
	return jsonSchema.parse(jsonStr);
}

export function jsonGzipArrayToJsonStr(tsvGzip: Uint8Array): string {
	const decompressed = gunzipSync(tsvGzip);
	const decoder = new TextDecoder();
	const tsvText = decoder.decode(decompressed);
	const trimText = tsvText.trim();

	return trimText;
}

export function jsonObjToJsonGzipArray<T extends object>(json: T): Uint8Array {
	const jsonStr = json.toString();
	const encoder = new TextEncoder();
	const uint8Array = encoder.encode(jsonStr);
	const compressed = gzipSync(uint8Array);

	return compressed;
}
