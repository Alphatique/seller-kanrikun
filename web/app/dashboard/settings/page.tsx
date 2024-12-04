import { parse } from 'useragent';

import { Input } from '@seller-kanrikun/ui/components/input';
import { Label } from '@seller-kanrikun/ui/components/label';
import { Separator } from '@seller-kanrikun/ui/components/separator';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@seller-kanrikun/ui/components/table';

import { getSession, listSessions } from '~/lib/session';

import { SignOutAllSessionButton } from './sign-out';

export const metadata: Metadata = {
	title: '設定 | セラー管理君',
};

export default async function Page() {
	const [session, sessions] = await Promise.all([getSession(), listSessions()]);
	const { user } = session!;

	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>設定</h1>

			<Separator />

			<div className='grid gap-3'>
				<h2 className='font-bold text-2xl'>アカウント</h2>

				<div className='grid gap-1'>
					<Label htmlFor='name'>アカウント名</Label>
					<Input id='name' readOnly value={user.name} />
				</div>

				<div className='grid gap-1'>
					<Label htmlFor='email'>メールアドレス</Label>
					<Input id='email' readOnly value={user.email} />
				</div>

				<div className='grid gap-3'>
					<h3 className='font-bold text-xl'>セッション</h3>

					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>時刻</TableHead>
									<TableHead>デバイス</TableHead>
									<TableHead>IPアドレス</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessions.map(session => {
									const userAgent = parse(session.userAgent ?? undefined);

									return (
										<TableRow key={session.id}>
											<TableCell>
												{session.updatedAt.toLocaleString('ja-JP')}
											</TableCell>
											<TableCell>
												{userAgent.family}/{userAgent.os.family}
											</TableCell>
											<TableCell>{session.ipAddress}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					<div className='flex justify-end'>
						<SignOutAllSessionButton />
					</div>
				</div>
			</div>
		</div>
	);
}
