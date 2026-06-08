import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionDividerIcon } from '@/components/icons';
import { getChapterNumber, getTocSections } from '@/lib/chapters';
import { getBookPagination } from '@/lib/book-pagination';
import { linkProps } from '@/lib/links';
import { site } from '@/lib/site';

export const metadata: Metadata = {
	title: 'Table of Contents',
	description: `Chapters of ${site.title}`,
};

export default function TableOfContentsPage() {
	const { foreword, numbered, backMatter } = getTocSections();
	const pageBySlug = new Map(
		getBookPagination().chapters.map((meta) => [meta.slug, meta.startPage]),
	);

	const pageFor = (slug: string) => pageBySlug.get(slug) ?? '';

	return (
		<main className="page page--toc">
			<header className="toc-header">
				<p className="toc-header__label">Table of Contents</p>
				<h1 className="toc-header__title">{site.title}</h1>
				<p className="toc-header__author">
					by{' '}
					<a href={site.authorUrl} {...linkProps(site.authorUrl)}>
						{site.author}
					</a>
				</p>
			</header>

			<nav className="toc" aria-label="Table of contents">
				<section className="toc-section">
					<Link className="toc-entry" href="/cover">
						<span className="toc-entry__title">Cover</span>
						<span className="toc-entry__leader" aria-hidden="true" />
						<span className="toc-entry__page">1</span>
					</Link>
				</section>

				<p className="toc-divider" aria-hidden="true">
					<SectionDividerIcon />
				</p>

				{foreword && (
					<section className="toc-section">
						<h2 className="toc-section__label">Foreword</h2>
						<Link className="toc-entry" href={`/chapters/${foreword.slug}`}>
							<span className="toc-entry__title">Foreword &amp; Introduction</span>
							<span className="toc-entry__leader" aria-hidden="true" />
							<span className="toc-entry__page">{pageFor(foreword.slug)}</span>
						</Link>
					</section>
				)}

				<p className="toc-divider" aria-hidden="true">
					<SectionDividerIcon />
				</p>

				<section className="toc-section">
					<h2 className="toc-section__label">Chapters</h2>
					<ol className="toc-list">
						{numbered.map((chapter) => {
							const number = getChapterNumber(chapter);
							return (
								<li key={chapter.slug} className="toc-list__item">
									<Link className="toc-entry" href={`/chapters/${chapter.slug}`}>
										{number !== null && (
											<span className="toc-entry__number">{number}.</span>
										)}
										<span className="toc-entry__body">
											<span className="toc-entry__title">{chapter.title}</span>
											{chapter.description && (
												<span className="toc-entry__desc">{chapter.description}</span>
											)}
										</span>
										<span className="toc-entry__leader" aria-hidden="true" />
										<span className="toc-entry__page">{pageFor(chapter.slug)}</span>
									</Link>
								</li>
							);
						})}
					</ol>
				</section>

				{backMatter.length > 0 && (
					<>
						<p className="toc-divider" aria-hidden="true">
							<SectionDividerIcon />
						</p>
						<section className="toc-section">
							<h2 className="toc-section__label">Back matter</h2>
							{backMatter.map((item) => (
								<Link
									key={item.slug}
									className="toc-entry"
									href={`/chapters/${item.slug}`}
								>
									<span className="toc-entry__title">{item.title}</span>
									<span className="toc-entry__leader" aria-hidden="true" />
									<span className="toc-entry__page">{pageFor(item.slug)}</span>
								</Link>
							))}
						</section>
					</>
				)}
			</nav>
		</main>
	);
}
