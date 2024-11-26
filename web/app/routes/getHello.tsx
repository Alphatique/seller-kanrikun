import { useState } from 'react';

export default () => {
	const [text, setText] = useState('');

	fetch('http://127.0.0.1:8787/hello').then(async res => {
		const text = await res.text();
		console.log(text);

		setText(text);
	});

	return <div>{text}</div>;
};
