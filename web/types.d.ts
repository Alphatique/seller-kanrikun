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

type SessionCvrData = {
	date: Date;
	name: string;
	asin: string;
	sales: number;
	units: number;
	averagePrice: number;
	pageViews: number;
	sessionCvr: number;
	pageViewCvr: number;
	roas: number;
	acos: number;
};
