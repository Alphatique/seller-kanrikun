'use client';

import { Button } from '@seller-kanrikun/ui/components/button';
import { useConfirm } from '@seller-kanrikun/ui/confirm-dialog';

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
