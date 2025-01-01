import { isAfter, isBefore } from 'date-fns';

import type { CostPriceTsv, UpdateCostPriceRequest } from '../types/cost-price';

export function addCostPrices(
	existData: CostPriceTsv[],
	requestData: UpdateCostPriceRequest,
): CostPriceTsv[] {
	// リクエストをtsvにする形式に変換
	const requestTsv = updateRequestToTsv(requestData);
	// 既存のデータからリクエストの期間を削除
	const existSplit = splitOverlaps(
		existData,
		requestData.date.from,
		requestData.date.to,
	);

	// 既存データとリクエストデータを結合
	const mergedData = [...existSplit, ...requestTsv];
	// asin, price, startDate の順でソート
	const sortedData = sortByAsinPriceDate(mergedData);
	// 被っているデータのマージ
	const resultArray = mergeSameData(sortedData);

	return resultArray;
}

// 特定の期間のデータを削除する関数
function splitOverlaps(
	existData: CostPriceTsv[],
	reqStart: Date,
	reqEnd: Date,
): CostPriceTsv[] {
	const resultArray: CostPriceTsv[] = [];

	for (const row of existData) {
		// rowの開始・終了がリクエストと全く被らない場合はそのまま
		if (isBefore(row.endDate, reqStart) || isAfter(row.startDate, reqEnd)) {
			resultArray.push(row);
			continue;
		}

		// rowの前半(開始)がリクエストと被る場合
		if (isBefore(row.startDate, reqStart)) {
			resultArray.push({
				...row,
				endDate: reqStart, // リクエストの終了~のデータとする
			});
		}

		// rowの後半(終了)がリクエストと被る場合
		if (isAfter(row.endDate, reqEnd)) {
			resultArray.push({
				...row,
				startDate: reqEnd, // リクエストの開始~のデータとする
			});
		}
	}

	return resultArray;
}

// リクエストデータをTSVデータに変換する関数
function updateRequestToTsv(
	requestData: UpdateCostPriceRequest,
): CostPriceTsv[] {
	const resultArray: CostPriceTsv[] = [];

	for (const row of requestData.data) {
		const { date } = requestData;
		const { from, to } = date;
		resultArray.push({
			asin: row.ASIN,
			startDate: from,
			endDate: to,
			price: row.Price,
		});
	}

	return resultArray;
}

// ASIN, price, startDate の順でソートする関数
function sortByAsinPriceDate(data: CostPriceTsv[]): CostPriceTsv[] {
	return data.sort((a, b) => {
		// 1) ASIN の文字列比較
		if (a.asin !== b.asin) {
			return a.asin.localeCompare(b.asin);
		}

		// 2) price の昇順 (小さい順)
		if (a.price !== b.price) {
			return a.price - b.price;
		}

		// 3) 開始日時 (startDate) の昇順
		const aTime = new Date(a.startDate).getTime();
		const bTime = new Date(b.startDate).getTime();
		return aTime - bTime;
	});
}

function mergeSameData(sortedData: CostPriceTsv[]): CostPriceTsv[] {
	const resultArray: CostPriceTsv[] = [];
	for (const current of sortedData) {
		// 直前のデータを取得
		const last = resultArray[resultArray.length - 1];
		// 直前のデータとasin, price が同じかつ、直前の終了日と今の開始日が被る場合
		if (
			last &&
			last.asin === current.asin &&
			last.price === current.price &&
			// 重複(もしくは連続)しているかどうか
			last.endDate >= current.startDate
		) {
			// マージ: 終了日を大きいほうで更新
			if (current.endDate > last.endDate) {
				last.endDate = current.endDate;
			}
			// 重複していない場合はそのまま追加
		} else {
			// 新規として追加
			resultArray.push({ ...current });
		}
	}

	return resultArray;
}
