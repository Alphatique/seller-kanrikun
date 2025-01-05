import { Separator } from '@seller-kanrikun/ui/components/separator';

import { SessionCvrTableFilter } from './data-filter';

export const metadata: Metadata = {
	title: 'セッション/CVR | セラー管理君',
};

export default function Page() {
	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>セッション/CVR</h1>
			<Separator />
			<SessionCvrTableFilter />
		</div>
	);
}
