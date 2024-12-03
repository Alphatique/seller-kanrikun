type LayoutProps<ParamKeys extends string = string> = Readonly<{
	params: Promise<Record<ParamKeys, string>>;
	children: React.ReactNode;
}>;

type PageProps<ParamKeys extends string = string> = Readonly<{
	params: Promise<Record<ParamKeys, string>>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;
