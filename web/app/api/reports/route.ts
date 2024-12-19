import { getApi } from '../r2';

export async function GET(request: Request): Promise<Response> {
	return getApi(request, 'settlement-report.tsv.gz');
}
