'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@seller-kanrikun/ui/components/button';
import { useConfirm } from '@seller-kanrikun/ui/confirm-dialog';

import { passkey } from '@seller-kanrikun/auth/client';
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
	const router = useRouter();

	async function onClick() {
		const { error } = (await passkey.addPasskey())!;

		if (!error) {
			router.refresh();
		}
	}

	return <Button onClick={onClick}>パスキーを作成</Button>;
}
