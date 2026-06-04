import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CHAPTERS_DIR = path.join(process.cwd(), 'content/chapters');

export type Chapter = {
	slug: string;
	title: string;
	description?: string;
	order: number;
	content: string;
};

export function getOrderedChapters(): Chapter[] {
	if (!fs.existsSync(CHAPTERS_DIR)) return [];

	return fs
		.readdirSync(CHAPTERS_DIR)
		.filter((file) => file.endsWith('.md'))
		.map((file) => {
			const slug = file.replace(/\.md$/, '');
			const raw = fs.readFileSync(path.join(CHAPTERS_DIR, file), 'utf8');
			const { data, content } = matter(raw);
			return {
				slug,
				title: String(data.title),
				description: data.description ? String(data.description) : undefined,
				order: Number(data.order),
				content,
			};
		})
		.sort((a, b) => a.order - b.order);
}

export function getChapterBySlug(slug: string): Chapter | undefined {
	return getOrderedChapters().find((c) => c.slug === slug);
}

export function isGlossary(chapter: Chapter): boolean {
	return chapter.slug.includes('glossary') || chapter.title === 'Glossary';
}

export function getChapterNumber(chapter: Chapter): number | null {
	if (chapter.order <= 1 || isGlossary(chapter)) return null;
	return chapter.order - 1;
}

export function getTocSections() {
	const chapters = getOrderedChapters();
	const foreword = chapters.find((c) => c.order === 1) ?? null;
	const numbered = chapters.filter((c) => c.order > 1 && !isGlossary(c));
	const backMatter = chapters.filter((c) => isGlossary(c));
	return { foreword, numbered, backMatter };
}

export function getSectionLabel(chapter: Chapter): string {
	if (chapter.order === 1) return 'Foreword & Introduction';
	if (chapter.title === 'Glossary') return 'Glossary';
	const num = getChapterNumber(chapter);
	return num ? `Chapter ${num}` : chapter.title;
}

export function formatChapterNavLabel(chapter: Chapter): string {
	if (chapter.order === 1) return 'Foreword';
	if (isGlossary(chapter)) return 'Glossary';
	const num = getChapterNumber(chapter);
	return num ? `${num}. ${chapter.title}` : chapter.title;
}
