import { gunzipSync, gzipSync } from 'fflate';

export async function generateR2Hash(
	accountId: string,
	dataName: string,
): Promise<string> {
	const rawString = `${accountId}/${dataName}`;
	const encoder = new TextEncoder();
	const data = encoder.encode(rawString);
	// SHA-256 でハッシュ化
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	// 16進文字列に変換
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
	return hashHex;
}

export function removeDuplicatesAndEmpty<T extends Record<string, unknown>>(
	dataArray: T[],
	key: string,
): T[] {
	return dataArray.filter((doc, index, array) => {
		// keyが空白でないか確認
		if (!doc[key]) {
			return false;
		}

		// keyが初めて登場するインデックスであるか確認
		const firstIndex = array.findIndex(d => d[key] === doc[key]);
		return firstIndex === index;
	});
}

export function removeEmpty<T extends Record<string, unknown>>(
	data: T[],
	key: string,
): T[] {
	return data.filter(doc => {
		if (!doc[key] || doc[key] === '') {
			return false;
		}
		return true;
	});
}

export function JsonToGzip(array: Record<string, unknown>[]): Uint8Array {
	// json文字列化
	const jsonString = JSON.stringify(array);
	// gzip化
	const compressed = gzipSync(new TextEncoder().encode(jsonString));

	return compressed;
}

export function GzipToJson<T extends Record<string, unknown>>(
	gzip: Uint8Array,
): T[] {
	// gzip解凍
	const decompressed = gunzipSync(gzip);
	// jsonパース
	const jsonString = new TextDecoder().decode(decompressed);
	const json = JSON.parse(jsonString);

	return json;
}
