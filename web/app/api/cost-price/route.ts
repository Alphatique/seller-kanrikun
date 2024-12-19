import { getApi, putApi } from '../r2';

const fileStr = 'cost-price.tsv.gz';
export async function GET(request: Request): Promise<Response> {
	return getApi(request, fileStr);
}

export async function POST(request: Request): Promise<Response> {
	return putApi(request, fileStr);
}
