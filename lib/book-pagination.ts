import { getOrderedChapters, type Chapter } from '@/lib/chapters';

/**
 * Approximate book-wide page numbers for TOC and contents panels.
 * Runtime pagination in the reader is computed from CSS columns and varies
 * with viewport, font size, and theme — do not use these for reader footers.
 */
const WORDS_PER_PAGE = 280;

export type ChapterPageMeta = {
	slug: string;
	order: number;
	startPage: number;
	pageCount: number;
};

export type BookPagination = {
	chapters: ChapterPageMeta[];
	totalPages: number;
};

export function estimatePageCount(content: string): number {
	const words = content.trim().split(/\s+/).filter(Boolean).length;
	const codeBlocks = Math.floor((content.match(/```/g) || []).length / 2);

	// Word count drives most pages; code blocks consume roughly half a page each.
	const estimate = words / WORDS_PER_PAGE + codeBlocks * 0.4;

	return Math.max(1, Math.ceil(estimate));
}

export function getBookPagination(): BookPagination {
	const chapters = getOrderedChapters();
	let nextPage = 2;

	const meta = chapters.map((chapter) => {
		const pageCount = estimatePageCount(chapter.content);
		const entry: ChapterPageMeta = {
			slug: chapter.slug,
			order: chapter.order,
			startPage: nextPage,
			pageCount,
		};
		nextPage += pageCount;
		return entry;
	});

	return { chapters: meta, totalPages: Math.max(1, nextPage - 1) };
}

export function getChapterPageMeta(slug: string): ChapterPageMeta | undefined {
	return getBookPagination().chapters.find((chapter) => chapter.slug === slug);
}

export function getChapterPageMetaByOrder(order: number): ChapterPageMeta | undefined {
	return getBookPagination().chapters.find((chapter) => chapter.order === order);
}

export function formatPageRange(meta: ChapterPageMeta): string {
	if (meta.pageCount <= 1) return String(meta.startPage);
	return `${meta.startPage}–${meta.startPage + meta.pageCount - 1}`;
}

export function getPageMetaForChapter(chapter: Chapter): ChapterPageMeta {
	return (
		getChapterPageMeta(chapter.slug) ?? {
			slug: chapter.slug,
			order: chapter.order,
			startPage: chapter.order,
			pageCount: 1,
		}
	);
}
