'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

interface Props {
	date: number;
}

export const Time = dynamic(async () =>
	memo(({ date }: Props) => new Date(date).toLocaleString('ja-JP')),
);
