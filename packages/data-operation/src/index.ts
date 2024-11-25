export * from './account';
export * from './seller/catalog';
export * from './seller/inventory';
export * from './seller/reports';

export async function generateR2Hash(userId: string, dataName: string) {
	const rawString = `${userId}/${dataName}`;
	const encoder = new TextEncoder();
	const data = encoder.encode(rawString);
	// SHA-256 でハッシュ化
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	// 16進文字列に変換
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
