import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';

export const myDuckDBAtom = atom<{
	db: AsyncDuckDB;
	c: AsyncDuckDBConnection;
} | null>(null);

export const fileLoadedAtom = atomWithImmer({
	report: false,
	inventory: false,
	costPrice: false,
});

export function ClientProvider({ children }: { children: React.ReactNode }) {
	return children;
}
