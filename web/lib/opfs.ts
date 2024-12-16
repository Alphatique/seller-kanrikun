const opfsRoot = await global?.navigator?.storage?.getDirectory();
const projectRoot = await opfsRoot?.getDirectoryHandle('seller-kanrikun', {
	create: true,
});
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
