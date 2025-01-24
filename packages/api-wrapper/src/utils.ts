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

export async function saveCombineData<DataType, SchemaType extends z.Schema>(
	bucketName: string,
	fileName: string,
	userId: string,
	newData: DataType[],
	schema: SchemaType,
) {
	const existResponse = await getFile(bucketName, userId, fileName);
	const existByteArray = await existResponse?.Body?.transformToByteArray();
	if (existByteArray === undefined) return;
	const unzipped = gunzipSync(existByteArray);
	const existText = strFromU8(unzipped);
	const existData: DataType[] = schema.parse(JSON.parse(existText));

	const response = [...existData, ...newData];

	const responseText = response.toString();
	const responseByteArray = strToU8(responseText);
	const gzip = gzipSync(responseByteArray);

	return await putFile(bucketName, userId, fileName, gzip);
}

export type ValueOf<T> = T[keyof T];
