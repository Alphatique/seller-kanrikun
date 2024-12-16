const worker = self as unknown as Worker;

// ファイルをワーカーで同期的に更新
worker.addEventListener('message', async event => {
	const { fileName, data } = event.data;
	const opfsRoot = await global.navigator.storage?.getDirectory();
	const projectRoot = await opfsRoot.getDirectoryHandle('seller-kanrikun', {
		create: true,
	});
	const fileHandle = await projectRoot.getFileHandle(fileName, {
		create: true,
	});

	const accessHandle = await fileHandle.createSyncAccessHandle();
	// テキストのエンコードとデコードをするためにインスタンスを取得
	const textEncoder = new TextEncoder();

	// メインスレッドから受け取ったテキストをエンコード
	const content = textEncoder.encode(`${data}`);
	// ファイルの先頭から内容を同期的に書き込む
	accessHandle.write(content, { at: 0 });
	// 変更をディスクに書き込み、FileSystemSyncAccessHandleを閉じる
	accessHandle.flush();
	accessHandle.close();

	worker.postMessage({ fileName });
});
