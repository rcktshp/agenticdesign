import {
	getChapterNumber,
	getOrderedChapters,
	isGlossary,
} from '@/lib/chapters';
import { getBookPagination } from '@/lib/book-pagination';
import type { ReaderChapter } from '@/components/ReaderChrome';

function getContentsLabel(chapter: ReturnType<typeof getOrderedChapters>[number]): string {
	if (chapter.order === 1) return 'Foreword & Introduction';
	if (isGlossary(chapter)) return chapter.title;
	const number = getChapterNumber(chapter);
	return number ? `Chapter ${number}. ${chapter.title}` : chapter.title;
}

export function getReaderChapters(): ReaderChapter[] {
	const { chapters: pageMeta } = getBookPagination();
	const pageBySlug = new Map(pageMeta.map((meta) => [meta.slug, meta.startPage]));

	const cover: ReaderChapter = {
		slug: 'cover',
		title: 'Cover',
		label: 'Cover',
		order: 0,
		startPage: 1,
		href: '/cover',
	};

	const chapters = getOrderedChapters().map((chapter) => ({
		slug: chapter.slug,
		title: chapter.title,
		label: getContentsLabel(chapter),
		order: chapter.order,
		startPage: pageBySlug.get(chapter.slug) ?? chapter.order,
		href: `/chapters/${chapter.slug}`,
	}));

	return [cover, ...chapters];
}

export function getTotalBookPages(): number {
	return getBookPagination().totalPages;
}
