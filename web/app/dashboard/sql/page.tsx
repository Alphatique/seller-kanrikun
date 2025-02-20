import { Separator } from '@seller-kanrikun/ui/components/separator';

import { SqlEditor } from './editor';

export const metadata: Metadata = {
	title: 'PL/BS | SQLエディター',
};

export default function Page() {
	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>SQL</h1>
			<Separator />
			<SqlEditor />
		</div>
	);
}
