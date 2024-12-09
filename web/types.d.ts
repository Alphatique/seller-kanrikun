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

type SessionCvrData =
	| 'sales'
	| 'number_of_units_sold'
	| 'average_unit_price'
	| 'number_of_accesses'
	| 'cvr_unit_session'
	| 'cvr_unit_page_view'
	| 'roas'
	| 'acos';
