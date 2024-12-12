import { headers as _headers } from 'next/headers';
import { parse } from 'useragent';

import { auth } from '@seller-kanrikun/auth/server';
import { Badge } from '@seller-kanrikun/ui/components/badge';
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

import { Time } from '~/components/time';
import { getSession } from '~/lib/session';

import { CreatePasskeyButton, SignOutAllSessionButton } from './client';

export const metadata: Metadata = {
	title: '設定 | セラー管理君',
};

export default async function Page() {
	const headers = await _headers();

	const [_session, sessions, passkeys] = await Promise.all([
		getSession(),
		auth.api.listSessions({
			headers,
		}),
		auth.api.listPasskeys({
			headers,
		}),
	]);
	const { user, session } = _session!;

	return (
		<div className='grid gap-4'>
			<h1 className='font-bold text-3xl'>設定</h1>

			<Separator />

			<div className='grid gap-4'>
				<h2 className='font-bold text-2xl'>アカウント</h2>

				<div className='grid gap-2'>
					<Label htmlFor='name'>アカウント名</Label>
					<Input id='name' readOnly value={user.name} />
				</div>

				<div className='grid gap-2'>
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
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessions.map(
									({
										id,
										userAgent,
										ipAddress,
										updatedAt,
									}) => {
										const {
											family,
											os: { family: osFamily },
										} = parse(userAgent ?? undefined);

										return (
											<TableRow key={id}>
												<TableCell>
													<Time
														date={updatedAt.getTime()}
													/>
												</TableCell>
												<TableCell>
													{family} / {osFamily}
												</TableCell>
												<TableCell>
													{ipAddress}
												</TableCell>
												<TableCell className='text-right'>
													{id === session.id && (
														<Badge
															variant='outline'
															className='rounded-full bg-blue-200'
														>
															現在使用中のデバイス
														</Badge>
													)}
												</TableCell>
											</TableRow>
										);
									},
								)}
							</TableBody>
						</Table>
					</div>

					<div className='flex justify-end'>
						<SignOutAllSessionButton />
					</div>
				</div>

				<div className='grid gap-3'>
					<h3 className='font-bold text-xl'>パスキー</h3>

					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>名前</TableHead>
									<TableHead>作成時刻</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{passkeys.map(({ id, name, createdAt }) => (
									<TableRow key={id}>
										<TableCell>{name}</TableCell>
										<TableCell>
											<Time date={createdAt.getTime()} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<div className='flex justify-end'>
						<CreatePasskeyButton />
					</div>
				</div>
			</div>
		</div>
	);
}
