import { Separator } from '@seller-kanrikun/ui/components/separator';

import PlbsTableFilter from './table-filter';

export const metadata: Metadata = {
	title: 'PL/BS | セラー管理君',
};

export default function Page() {
	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>PL/BS</h1>
			<Separator />
			<PlbsTableFilter />
		</div>
	);
}
