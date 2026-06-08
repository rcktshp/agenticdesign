import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MarkdownContent from '@/components/MarkdownContent';
import ReaderProse from '@/components/ReaderProse';
import ReaderExperience from '@/components/ReaderExperience';
import {
	getChapterBySlug,
	getOrderedChapters,
	getSectionRunningLabel,
} from '@/lib/chapters';
import { getPageMetaForChapter } from '@/lib/book-pagination';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
	return getOrderedChapters().map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const chapter = getChapterBySlug(slug);
	if (!chapter) return {};
	return {
		title: chapter.title,
		description: chapter.description,
	};
}

export default async function ChapterPage({ params }: Props) {
	const { slug } = await params;
	const chapter = getChapterBySlug(slug);
	if (!chapter) notFound();

	const chapters = getOrderedChapters();
	const chapterIndex = chapters.findIndex((c) => c.slug === slug);
	const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
	const nextChapter =
		chapterIndex >= 0 && chapterIndex < chapters.length - 1
			? chapters[chapterIndex + 1]
			: null;
	const sectionLabel = getSectionRunningLabel(chapter);
	const pageMeta = getPageMetaForChapter(chapter);

	return (
		<article className="chapter-layout reader-page">
			<ReaderExperience
				key={slug}
				chapterKey={slug}
				chapterLabel={sectionLabel}
				startPage={pageMeta.startPage}
				prevHref={
					chapterIndex === 0 ? '/cover' : prevChapter ? `/chapters/${prevChapter.slug}` : undefined
				}
				nextHref={nextChapter ? `/chapters/${nextChapter.slug}` : undefined}
			>
				<header className="chapter-header">
					<p className="chapter-section-label">{sectionLabel}</p>
					<h1 className="chapter-header__title">{chapter.title}</h1>
				</header>

				<div className="chapter-prose reader-prose">
					<ReaderProse slug={slug}>
						<MarkdownContent content={chapter.content} />
					</ReaderProse>
				</div>
			</ReaderExperience>
		</article>
	);
}
