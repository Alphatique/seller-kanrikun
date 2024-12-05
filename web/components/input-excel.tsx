import { Input } from '@seller-kanrikun/ui/components/input';

export default function InputExcel({
	onFileChange,
}: { onFileChange: (file: File | null) => void }) {
	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		onFileChange(file);
	};

	return (
		<div className='grid w-auto max-w-sm items-center gap-1.5'>
			<Input
				id='upload'
				type='file'
				accept='.xls,.xlsx'
				className='hover:cursor-pointer'
				onChange={handleOnChange}
			/>
		</div>
	);
}
