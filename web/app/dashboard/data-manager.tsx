import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { atomWithImmer } from 'jotai-immer';

import { initDuckDB } from '~/lib/duckdb';

class MyDataManager {}

export const dataManagerAtom = atomWithImmer(new MyDataManager());
