import { getFile, putFile } from '@seller-kanrikun/data-operation/r2';
import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate';
import type { z } from 'zod';

// amazonがレートリミットを書いてくれてたり書いてくれなかったりするのでそれを良しなにしたりしてレート待ちをするやつ
export async function waitRateLimitTime(
	response: Response,
	defaultWaitTime = 60,
) {
	const limitStr = response.headers.get('x-amzn-ratelimit-limit');
	const waitTime =
		limitStr !== null && !Number.isNaN(Number(limitStr))
			? 1 / Number(limitStr)
			: defaultWaitTime;
	await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
}

export type ValueOf<T> = T[keyof T];
