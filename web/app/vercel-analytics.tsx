// web/app/vercel-analytics.tsx
'use client'; // ← これでクライアントコンポーネント化

import { Analytics } from '@vercel/analytics/react';

export function VercelAnalytics() {
	return <Analytics />;
}
