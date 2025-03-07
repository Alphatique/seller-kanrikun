import { Separator } from '@seller-kanrikun/ui/components/separator';

import { ItemsTableFilter } from './table-filter';

export const metadata: Metadata = {
	title: '商品別明細 | セラー管理くん',
};

export default function Page() {
	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>商品別明細</h1>
			<Separator />
			<ItemsTableFilter />
		</div>
	);
}
