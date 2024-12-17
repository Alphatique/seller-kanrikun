const opfsRoot = await global?.navigator?.storage?.getDirectory();
const projectRoot = await opfsRoot?.getDirectoryHandle('seller-kanrikun', {
	create: true,
});
const updateTime = 7 * 24 * 60 * 60 * 1000;

import { gunzipSync } from 'fflate';

import type { Fetcher } from 'swr';

export const SWRLoadFile: Fetcher<
	string | null,
	{
		fileName: string;
		fetchUrl: string;
		sessionId: string;
		updateTime: number;
	}
> = async key => {
	const { fileName, fetchUrl, sessionId, updateTime } = key;

	const fileData = await loadFile(fileName, updateTime, async () => {
		const response = await fetch(fetchUrl, {
			method: 'GET',
			headers: {
				'x-seller-kanrikun-session-id': sessionId,
			},
		});
		if (response.ok) {
			const data = await response.arrayBuffer();
			return new Uint8Array(data);
		}
		const error = await response.text();
		console.error(`Failed to fetch '${fetchUrl}':`, response, error);
		return undefined;
	});
	if (fileData === null) return null;

	// ファイルを解凍して文字列として渡す
	const decompressed = gunzipSync(fileData);

	const decoder = new TextDecoder();
	const csvContent: string = decoder.decode(decompressed);

	return csvContent;
};

// ファイルが存在するか確認
export async function loadFile(
	fileName: string,
	updateTime: number,
	fetchFunc: () => Promise<Uint8Array | undefined>,
): Promise<Uint8Array | null> {
	if (!projectRoot) return null;

	const editingFileName = `editing-${fileName}`;
	// プロジェクト内のファイルを取得
	const files = await projectRoot.values();

	let isEditing = false;
	let existData: Uint8Array | undefined = undefined;
	for await (const value of files) {
		if (value.name === editingFileName && value.kind === 'file') {
			// 対象の編集中ファイルがある場合は終了
			isEditing = true;
			break;
		} else if (value.name === fileName && value.kind === 'file') {
			// 対象ファイルがある場合
			const fileHandle = value as FileSystemFileHandle;
			// 対象ファイルを取得
			const file = await fileHandle.getFile();
			if (new Date().getTime() < file.lastModified + updateTime) {
				existData = new Uint8Array(await file.arrayBuffer());
			}
		}
	}

	if (!isEditing && existData !== undefined) {
		return existData;
	}
	const worker = new Worker(
		new URL('~/lib/opfs-write-worker', import.meta.url),
	);
	// 更新データを取得
	const fetchedData = await fetchFunc();
	// データが取得できなかった場合はエラーを出力
	if (fetchedData === undefined) {
		console.error(`${fileName} fetchFunc returned undefined`);
		return null;
	}
	// 編集中ファイルを作成
	projectRoot.getFileHandle(editingFileName, { create: true });
	// データを更新
	worker.postMessage({ fileName, data: fetchedData });
	// ワーカーからのメッセージを待つ
	worker.onmessage = async event => {
		if (event.data.fileName === fileName) {
			// 編集中ファイルを削除
			projectRoot.removeEntry(editingFileName);
			// ワーカーを終了
			worker.terminate();
		}
	};
	return fetchedData;
}
