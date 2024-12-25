import { type NextRequest, NextResponse } from 'next/server';

import {
	getApi,
	settlementReportFileName,
	inventorySummariesFileName,
	costPriceFileName,
} from '~/lib/r2';

const basicGetMap: Record<string, string> = {
	reports: settlementReportFileName,
	cost: costPriceFileName,
	inventory: inventorySummariesFileName,
};

export async function GET(
	request: NextRequest,
	params: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
	const slug = await params.params;
	console.log(slug);
	const fileName = basicGetMap[slug.slug];

	if (!fileName) {
		return new NextResponse('Not Found', { status: 404 });
	}

	// 共通処理を呼び出す
	const res = await getApi(request, fileName);
	return new NextResponse(res.body, res);
}
