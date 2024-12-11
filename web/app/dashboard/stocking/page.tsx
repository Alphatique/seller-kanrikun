import { Separator } from '@seller-kanrikun/ui/components/separator';

import StockingTable from './table';

export const metadata: Metadata = {
	title: '仕入れサポート | セラー管理君',
};

export default function Page() {
	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>仕入れサポート</h1>
			<Separator />
			<StockingTable />
		</div>
	);
}
