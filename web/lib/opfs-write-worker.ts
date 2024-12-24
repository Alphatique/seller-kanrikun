'use client';

import { projectRoot } from './opfs';

const worker = self as unknown as Worker;

// ファイルをワーカーで同期的に更新
worker.addEventListener('message', async event => {
	// 保存するファイル名とデータを取得
	const { fileName, data } = event.data;
	// ファイルハンドルを取得
	const fileHandle = await projectRoot.getFileHandle(fileName, {
		create: true,
	});

	// ファイルハンドルから同期アクセスハンドルを取得
	const accessHandle = await fileHandle.createSyncAccessHandle();

	// データをUint8Arrayに変換
	const content = data instanceof Uint8Array ? data : new Uint8Array(data);

	// ファイルの先頭から content を同期的に書き込む
	accessHandle.write(content, { at: 0 });

	// ディスクに変更を書き込み、ハンドルを閉じる
	accessHandle.flush();
	accessHandle.close();

	// ワーカーに完了を通知
	worker.postMessage({ fileName });
});
