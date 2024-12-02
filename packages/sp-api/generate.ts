import { readFile, writeFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import openapiTS, { astToString } from 'openapi-typescript';

import { models } from './generate.config';

const files = unzipSync(
	new Uint8Array(
		await (
			await (
				await fetch(
					'https://github.com/amzn/selling-partner-api-models/archive/refs/heads/main.zip',
				)
			).blob()
		).arrayBuffer(),
	),
	{
		filter: file =>
			file.name.match(
				/^selling-partner-api-models-main\/(?:models|schemas)/,
			) !== null,
	},
);

const textDecoder = new TextDecoder();

async function generateSchema(path: string, name: string) {
	const src = textDecoder.decode(
		files[`selling-partner-api-models-main/models/${path}`],
	);
	const converted = JSON.parse(
		await (
			await fetch('https://converter.swagger.io/api/convert', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: src,
			})
		).text(),
	);
	const ast = await openapiTS(converted);
	const content = astToString(ast);

	await writeFile(`./schema/${name}.ts`, content);
}

const clientTemplate = await readFile('./client.template.ts', 'utf-8');

async function generateClient(name: string) {
	const nameCamel = name.replace(/-./g, x => x[1].toUpperCase());

	const content = clientTemplate
		.replace('${NAME}', name)
		.replace('${NAME_CAMEL}', nameCamel);

	await writeFile(`./client/${name}.ts`, content);
}

for (const [path, name] of models) {
	await generateSchema(path, name);
	await generateClient(name);
}
