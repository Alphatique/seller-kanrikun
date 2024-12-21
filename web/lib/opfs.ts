'use client';
import { tsvGzipToTsvStr } from '@seller-kanrikun/data-operation/tsv-gzip';

// opfsのルートディレクトリを取得
const opfsRoot = await global?.navigator?.storage?.getDirectory();
// /seller-kanrikunをプロジェクトルートとする。要らん気もするけど一応
export const projectRoot = await opfsRoot?.getDirectoryHandle(
	'seller-kanrikun',
	{
		create: true,
	},
);

// swr経由でopfsなどからファイルを取得
export async function SWRLoadFile(
	fileName: string,
	fetchUrl: string,
	sessionId: string,
	cacheTime: number = 7 * 24 * 60 * 60 * 1000, // 1週間
): Promise<string | null> {
	console.log('SWRLoadFile');
	// ファイルを取得
	const fileData = await loadFile(
		fileName,
		cacheTime,
		// データがないなどの場合にfetchして取得する関数
		async () => {
			// fetch
			const response = await fetch(fetchUrl, {
				method: 'GET',
				headers: {
					'x-seller-kanrikun-session-id': sessionId,
				},
			});
			// レスポンスが正常な場合はデータを返す
			if (response.ok) {
				const data = await response.arrayBuffer();
				return new Uint8Array(data);
			}
			// エラーの場合はエラーを出力し、nullを返す
			const error = await response.text();
			console.error(`Failed to fetch '${fetchUrl}':`, response, error);
			return null;
		},
	);

	// データが取得できなかった場合はnullを返す
	if (fileData === null) return null;

	// データを解凍
	const tsvStr = tsvGzipToTsvStr(fileData);

	// データを返す
	return tsvStr;
}

// ファイルが存在するか確認
export async function loadFile(
	fileName: string,
	cacheTime: number,
	fetchFunc: () => Promise<Uint8Array | null>,
): Promise<Uint8Array | null> {
	// プロジェクトルートがない(サーバー上の場合)nullで終了
	if (!projectRoot) return null;

	// 編集中フラグ用のファイル名
	const editingFileName = `editing-${fileName}`;
	// プロジェクト内のファイル一覧を取得
	const files = await projectRoot.values();

	// 編集中フラグ
	let isEditing = false;
	// 既存のデータ
	let existData: Uint8Array | null = null;
	// ファイル一覧をループ
	for await (const value of files) {
		if (value.name === editingFileName && value.kind === 'file') {
			// 対象の編集中ファイルがある場合はフラグを立てループ終了
			isEditing = true;
			break;
		} else if (value.name === fileName && value.kind === 'file') {
			// 対象ファイルがある場合
			const fileHandle = value as FileSystemFileHandle;
			// 対象ファイルを取得
			const file = await fileHandle.getFile();
			if (new Date().getTime() < file.lastModified + cacheTime) {
				// 更新時間以内の場合はデータを保存
				existData = new Uint8Array(await file.arrayBuffer());
			}
		}
	}

	// 編集中でなく、データがある場合はデータを返す
	if (!isEditing && existData !== null) {
		return existData;
	}
	// 更新データを取得
	const fetchedData = await fetchFunc();
	// データが取得できなかった場合はエラーを出力
	if (fetchedData === undefined) {
		console.error(`${fileName} fetchFunc returned undefined`);
		return null;
	}
	// ワーカーを作成
	const worker = new Worker(
		new URL('~/lib/opfs-write-worker', import.meta.url),
	);
	// 編集中ファイルを作成
	projectRoot.getFileHandle(editingFileName, { create: true });
	// ワーカーでデータを更新
	worker.postMessage({ fileName, data: fetchedData });
	// ワーカーからの終了通知を待つ
	worker.onmessage = async event => {
		if (event.data.fileName === fileName) {
			// 編集中ファイルを削除
			projectRoot.removeEntry(editingFileName);
			// ワーカーを終了
			worker.terminate();
		}
	};

	// 更新データを返す
	return fetchedData;
}
