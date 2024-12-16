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

	const content = data instanceof Uint8Array ? data : new Uint8Array(data);

	// ファイルの先頭から content を同期的に書き込む
	accessHandle.write(content, { at: 0 });

	// ディスクに変更を書き込み、ハンドルを閉じる
	accessHandle.flush();
	accessHandle.close();

	worker.postMessage({ fileName });
});
