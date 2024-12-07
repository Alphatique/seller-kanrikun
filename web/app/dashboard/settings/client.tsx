'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { useForm } from 'react-hook-form';
import * as v from 'valibot';

import { Button } from '@seller-kanrikun/ui/components/button';
import { useConfirm } from '@seller-kanrikun/ui/confirm-dialog';

import { passkey, signOut } from '@seller-kanrikun/auth/client';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@seller-kanrikun/ui/components/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@seller-kanrikun/ui/components/form';
import { Input } from '@seller-kanrikun/ui/components/input';
import { useRouter } from 'next/navigation';
import { signOutAllSessions } from './actions';

export function SignOutAllSessionButton() {
	const confirm = useConfirm();

	async function onClick() {
		if (
			await confirm({
				title: 'サインアウト',
				description: '全てのデバイスからサインアウトしますか？',
				confirmText: 'サインアウト',
			})
		) {
			await signOutAllSessions();
		}
	}

	return <Button onClick={onClick}>全てのデバイスからサインアウトする</Button>;
}

export function CreatePasskeyButton() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>パスキーを作成</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>パスキーを作成</DialogTitle>
					<DialogDescription>
						名前を入力してパスキーを作成します
					</DialogDescription>
				</DialogHeader>
				<CreatePasskeyForm />
			</DialogContent>
		</Dialog>
	);
}

const createPasskeyFormSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, '名前を入力してください')),
});

export function CreatePasskeyForm() {
	const router = useRouter();
	const confirm = useConfirm();
	const form = useForm<v.InferInput<typeof createPasskeyFormSchema>>({
		resolver: valibotResolver(createPasskeyFormSchema),
		defaultValues: {
			name: '',
		},
	});

	async function onSubmit({
		name,
	}: v.InferInput<typeof createPasskeyFormSchema>) {
		const result = await passkey.addPasskey({
			name,
		});

		if (result?.error) {
			switch ((result.error as unknown as { code: string }).code) {
				case 'SESSION_IS_NOT_FRESH': {
					if (
						await confirm({
							title: 'セッションエラー',
							description: 'パスキーを作成するにはサインインし直してください',
							confirmText: 'サインアウト',
						})
					) {
						await signOut();
						router.push('/sign-in');
					}

					break;
				}
				default: {
					await confirm({
						title: 'エラー',
						description: 'パスキーの作成に失敗しました',
					});
				}
			}
		} else {
			router.refresh();
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>名前</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type='submit'>作成</Button>
			</form>
		</Form>
	);
}
