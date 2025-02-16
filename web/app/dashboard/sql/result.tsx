import { Button } from '@seller-kanrikun/ui/components/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MyDuckDB } from '~/lib/duckdb';
import { downloadStr } from '~/lib/file-downloads';

interface Props {
	myDuckDB: MyDuckDB | undefined;
	sqlText: string;
}

export function SqlResult({ myDuckDB, sqlText }: Props) {
	const [resultText, setResultText] = useState('db initializing...');
	const [debouncedValue, setDebouncedValue] = useState(sqlText);
	const debounceTime = 300;

	useEffect(() => {
		const timeoutId = setTimeout(
			() => setDebouncedValue(sqlText),
			debounceTime,
		);

		return () => clearTimeout(timeoutId);
	}, [sqlText, debounceTime]);
	useEffect(() => {
		if (!myDuckDB) {
			setResultText('db initializing...');
			return;
		}
		setResultText('sql executing...');

		let canceled = false;
		(async () => {
			try {
				const result = await myDuckDB.c.query(debouncedValue);
				if (!canceled) {
					setResultText(result.toString());
				}
			} catch (error) {
				if (!canceled) {
					setResultText(String(error));
				}
			}
		})();

		return () => {
			canceled = true;
		};
	}, [myDuckDB, debouncedValue]);

	function handleDownload() {
		downloadStr(resultText, 'sqlResult.txt');
	}

	return (
		<>
			<Button onClick={handleDownload}>ダウンロード</Button>
			<h3>{resultText}</h3>
		</>
	);
}
