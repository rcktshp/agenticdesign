import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir =
	'/Users/diegomartins/Library/CloudStorage/GoogleDrive-dpm0828@gmail.com/My Drive/Personal/eBook/ADS/chapters';
const destDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../content/chapters');

function parseChapterMeta(file, content) {
	const orderMatch = file.match(/^(\d+)-/);
	const order = orderMatch ? Number.parseInt(orderMatch[1], 10) + 1 : 1;

	if (file === '00-foreword-introduction.md') {
		const lines = content.split('\n');
		let bodyStart = 0;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith('# Foreword')) {
				bodyStart = i;
				break;
			}
		}
		return {
			order,
			title: 'Foreword & Introduction',
			description: 'Building Design Systems for the Age of Agents',
			body: lines.slice(bodyStart).join('\n').trim(),
		};
	}

	if (file === '09-glossary.md' || file.endsWith('-glossary.md')) {
		const lines = content.split('\n');
		let description;
		let bodyStart = 0;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith('# ')) {
				bodyStart = i + 1;
				break;
			}
		}
		for (let i = bodyStart; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line && !line.startsWith('---')) {
				description = line;
				bodyStart = i + 1;
				break;
			}
		}
		while (bodyStart < lines.length && (lines[bodyStart].trim() === '' || lines[bodyStart].trim() === '---')) {
			bodyStart++;
		}
		return {
			order,
			title: 'Glossary',
			description,
			body: lines.slice(bodyStart).join('\n').trim(),
		};
	}

	const lines = content.split('\n');
	let title = file.replace(/^\d+-/, '').replace(/\.md$/, '').replace(/-/g, ' ');
	let description;
	let bodyStart = 0;

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith('# ')) {
			title = lines[i]
				.slice(2)
				.trim()
				.replace(/^Chapter \d+:\s*/i, '');
			bodyStart = i + 1;
			break;
		}
	}

	for (let i = bodyStart; i < lines.length; i++) {
		const line = lines[i];
		if (line.startsWith('## ')) {
			description = line.slice(3).trim();
			bodyStart = i + 1;
			break;
		}
		if (line.trim() && !line.startsWith('---')) {
			break;
		}
	}

	while (bodyStart < lines.length && (lines[bodyStart].trim() === '' || lines[bodyStart].trim() === '---')) {
		bodyStart++;
	}

	return {
		order,
		title,
		description,
		body: lines.slice(bodyStart).join('\n').trim(),
	};
}

function toFrontmatter({ title, description, order }) {
	const lines = ['---', `title: ${JSON.stringify(title)}`];
	if (description) lines.push(`description: ${JSON.stringify(description)}`);
	lines.push(`order: ${order}`, '---', '');
	return lines.join('\n');
}

fs.mkdirSync(destDir, { recursive: true });

for (const existing of fs.readdirSync(destDir)) {
	if (existing.endsWith('.md')) fs.unlinkSync(path.join(destDir, existing));
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.md')).sort();

for (const file of files) {
	const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
	const meta = parseChapterMeta(file, content);
	const output = toFrontmatter(meta) + meta.body + '\n';
	fs.writeFileSync(path.join(destDir, file), output, 'utf8');
	console.log(`Imported ${file} → order ${meta.order}: ${meta.title}`);
}
