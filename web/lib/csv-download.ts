export function downloadCsv(
	data: object[],
	headers: string[],
	fileName: string,
): void {
	// データをCSV形式に変換
	const csvRows = data.map(item =>
		Object.values(item)
			.map(value => (typeof value === 'string' ? `"${value}"` : value))
			.join(','),
	);

	// ヘッダーとデータを結合
	const csvContent = [headers, ...csvRows].join('\n');

	// Blobを作成
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

	// ダウンロードリンクを作成
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = fileName;
	link.style.display = 'none';
	document.body.appendChild(link);

	// ダウンロードを実行
	link.click();

	// リンクを削除
	document.body.removeChild(link);
}

export function downloadStr(data: string, fileName: string): void {
	// Blobを作成
	const blob = new Blob([data], { type: 'text/plain;charset=utf-8;' });

	// ダウンロードリンクを作成
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = fileName;
	link.style.display = 'none';
	document.body.appendChild(link);

	// ダウンロードを実行
	link.click();

	// リンクを削除
	document.body.removeChild(link);
}
