export async function waitRateLimitTime(
	response: Response,
	defaultWaitTime = 60,
) {
	const limitStr = response.headers.get('x-amzn-ratelimit-limit');
	console.log('limitStr:', limitStr);
	const waitTime =
		limitStr !== null && !Number.isNaN(Number(limitStr))
			? 1 / Number(limitStr)
			: defaultWaitTime;
	console.log('waitTime:', waitTime);
	await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
}
