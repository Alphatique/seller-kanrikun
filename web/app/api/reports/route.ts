import { costPriceFileName, getApi } from '~/lib/r2';

export async function GET(request: Request): Promise<Response> {
	return getApi(request, costPriceFileName);
}
