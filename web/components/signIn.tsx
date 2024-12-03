'use client';

import { signIn } from '@seller-kanrikun/auth/client';

import { Button } from './ui/button';

export function SignIn() {
	return (
		<Button
			onClick={() =>
				signIn.oauth2({
					providerId: 'amazon',
				})
			}
		>
			SignIn
		</Button>
	);
}
