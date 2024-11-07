import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

enum Period {
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Yearly = 'Yearly',
}

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';

import DateRangeInput from '~/components/ui/self/daterange-input';
import { Switch } from '~/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

export default function HomePage() {
  const [uploadDate, setUploadDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [tableDate, setTableDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });


  return (
    <main>
      <Label>Welcome to the input price!</Label>
      <div className='grid w-full max-w-sm items-center gap-1.5'>
        <Label htmlFor='upload'>Choose file</Label>
        <Input id='upload' type='file' accept='.xls,.xlsx' />
      </div>

      <DateRangeInput date={uploadDate} setDate={setUploadDate} />
      <Button>Update</Button>

      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>原価入力について</AccordionTrigger>
          <AccordionContent>
            原価入力テンプレートのダウンロード
            まずは、指定された商品の原価を入力するためのテンプレートをダウンロードしてください。
            このテンプレートには、あらかじめ商品名や商品番号が入力されていますので、ユーザーが入力するのは原価情報のみです。
            原価の入力
            ダウンロードしたテンプレートを開き、「原価(円)」の欄に各商品の原価を入力してください。
            原価の入力
            入力された原価情報が適用される反映期間（開始日と終了日）を設定し、「反映」ボタンをクリックしてください。
            原価入力後のアップロード
            保存したテンプレートをアップロードしてください。入力された情報はPL
            BS画面等に反映されます。
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className='flex items-center space-x-2'>
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">最新</Label>
      </div>
      <DateRangeInput date={tableDate} setDate={setTableDate} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>商品名</TableHead>
            <TableHead>ASIN</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>適用開始日</TableHead>
            <TableHead>適用終了日</TableHead>
            <TableHead>原価(円)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>項目1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>項目2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </main>
  );
}