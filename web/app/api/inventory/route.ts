import { getApi, inventorySummariesFileName } from '~/lib/r2';

export async function GET(request: Request): Promise<Response> {
	return getApi(request, inventorySummariesFileName);
}
