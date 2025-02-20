import { gunzipSync, gzipSync } from 'fflate';
import type { Schema } from 'zod';

export function jsonGzipArrayToJsonObj<TSchema extends Schema>(
	jsonGzipArray: Uint8Array,
	jsonSchema: TSchema,
) {
	const jsonStr = jsonGzipArrayToJsonStr(jsonGzipArray);
	const json = JSON.parse(jsonStr);
	return jsonSchema.parse(json);
}

export function jsonGzipArrayToJsonStr(tsvGzip: Uint8Array): string {
	const decoder = new TextDecoder();
	const decompressed = gunzipSync(tsvGzip);
	const tsvText = decoder.decode(decompressed);
	const trimText = tsvText.trim();

	return trimText;
}

export function jsonObjToJsonGzipArray<T extends object>(json: T): Uint8Array {
	const jsonStr = JSON.stringify(json);
	const encoder = new TextEncoder();
	const uint8Array = encoder.encode(jsonStr);
	const compressed = gzipSync(uint8Array);

	return compressed;
}
