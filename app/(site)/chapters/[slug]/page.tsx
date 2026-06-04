import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChapterNav from '@/components/ChapterNav';
import MarkdownContent from '@/components/MarkdownContent';
import {
	formatChapterNavLabel,
	getChapterBySlug,
	getOrderedChapters,
	getSectionLabel,
} from '@/lib/chapters';

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
	const navChapters = chapters.map((c) => ({ slug: c.slug, title: c.title }));
	const sectionLabel = getSectionLabel(chapter);

	return (
		<article className="chapter-layout">
			<aside className="chapter-sidebar">
				<h2>Contents</h2>
				<ul className="chapter-sidebar__list">
					{chapters.map((c) => (
						<li key={c.slug}>
							<Link
								href={`/chapters/${c.slug}`}
								aria-current={c.slug === slug ? 'page' : undefined}
							>
								{formatChapterNavLabel(c)}
							</Link>
						</li>
					))}
				</ul>
			</aside>
			<div>
				<header>
					<p className="message-muted">{sectionLabel}</p>
					{chapter.order !== 1 && <h1>{chapter.title}</h1>}
				</header>
				<div className="chapter-prose">
					<MarkdownContent content={chapter.content} />
				</div>
				<ChapterNav chapters={navChapters} currentSlug={slug} />
			</div>
		</article>
	);
}
