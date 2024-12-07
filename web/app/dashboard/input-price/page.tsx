import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@seller-kanrikun/ui/components/accordion';
import { Separator } from '@seller-kanrikun/ui/components/separator';

import { InputPriceUpload } from './upload-xlsx';

export const metadata: Metadata = {
	title: '原価入力 | セラー管理君',
};

export default function Page() {
	function handleFileUpload() {
		console.log('handleFileUpload');
	}

	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>原価入力</h1>
			<Separator />
			<Accordion
				type='single'
				collapsible
				className='w-auto rounded-lg px-4 hover:bg-muted'
			>
				<AccordionItem value='item-1'>
					<AccordionTrigger>原価入力について</AccordionTrigger>
					<AccordionContent>
						<ul className='list-disc space-y-2 pl-5'>
							<li>
								<p>
									<a
										href='/template.xlsx'
										download='Seller管理くん-原価入力テンプレート.xlsx'
										className='text-blue-500 underline'
									>
										原価入力テンプレートのダウンロード
									</a>
								</p>
								<p>
									まずは、指定された商品の原価を入力するためのテンプレートをダウンロードしてください。このテンプレートには、あらかじめ商品名や商品番号が入力されていますので、ユーザーが入力するのは原価情報のみです。
								</p>
							</li>
							<li>
								<p>原価の入力</p>
								<p>
									ダウンロードしたテンプレートを開き、「原価(円)」の欄に各商品の原価を入力してください。
								</p>
							</li>
							<li>
								<p>原価入力後のアップロード</p>
								<p>
									保存したテンプレートをアップロードしてください。入力された原価情報が適用される反映期間（開始日と終了日）を設定し、「反映」ボタンをクリックしてください。入力された情報はPLBS画面等に反映されます。
								</p>
							</li>
						</ul>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<InputPriceUpload />
		</div>
	);
}
