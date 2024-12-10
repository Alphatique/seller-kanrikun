type LayoutProps<ParamKeys extends string = string> = Readonly<{
	params: Promise<Record<ParamKeys, string>>;
	children: React.ReactNode;
}>;

type PageProps<ParamKeys extends string = string> = Readonly<{
	params: Promise<Record<ParamKeys, string>>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

type Metadata = import('next').Metadata;

type Period = 'monthly' | 'quarterly' | 'yearly';

type PlbsTableMetaData = {
	key: string;
	head: string;
	indent: number;
	underLine?: boolean;
	doubleUnderLine?: boolean;
};

type SessionCvrData = {
	date: string;
	sales: number;
	number_of_units_sold: number;
	average_unit_price: number;
	number_of_accesses: number;
	cvr_unit_session: number;
	cvr_unit_page_view: number;
	roas: number;
	acos: number;
};

type ChartDataBase = {
	date: string;
	[key: string]: number | string;
};
