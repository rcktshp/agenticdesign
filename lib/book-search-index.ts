import { getChapterNumber, getOrderedChapters, isGlossary } from '@/lib/chapters';
import { getBookPagination } from '@/lib/book-pagination';
import type { BookSearchChapter } from '@/lib/book-search';

function getContentsLabel(chapter: ReturnType<typeof getOrderedChapters>[number]): string {
	if (chapter.order === 1) return 'Foreword & Introduction';
	if (isGlossary(chapter)) return chapter.title;
	const number = getChapterNumber(chapter);
	return number ? `Chapter ${number}. ${chapter.title}` : chapter.title;
}

export function stripMarkdown(content: string): string {
	return content
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]+`/g, ' ')
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/(\*\*|__|~~)/g, '')
		.replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
		.replace(/(^|[^_])_([^_]+)_/g, '$1$2')
		.replace(/^>\s+/gm, '')
		.replace(/^[-*+]\s+/gm, '')
		.replace(/^\d+\.\s+/gm, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function getBookSearchIndex(): BookSearchChapter[] {
	const { chapters: pageMeta } = getBookPagination();
	const pageBySlug = new Map(pageMeta.map((meta) => [meta.slug, meta.startPage]));

	return getOrderedChapters().map((chapter) => {
		const body = stripMarkdown(chapter.content);
		const plainText = [chapter.title, chapter.description, body].filter(Boolean).join(' ');

		return {
			slug: chapter.slug,
			label: getContentsLabel(chapter),
			href: `/chapters/${chapter.slug}`,
			startPage: pageBySlug.get(chapter.slug) ?? chapter.order,
			plainText,
		};
	});
}
