import type { Metadata } from 'next';
import Link from 'next/link';
import { getChapterNumber, getTocSections } from '@/lib/chapters';
import { linkProps } from '@/lib/links';
import { site } from '@/lib/site';

export const metadata: Metadata = {
	title: 'Table of Contents',
	description: `Chapters of ${site.title}`,
};

export default function TableOfContentsPage() {
	const { foreword, numbered, backMatter } = getTocSections();

	return (
		<main className="page page--toc">
			<h1 className="toc-page__title">{site.title}</h1>

			<nav className="toc" aria-label="Table of contents">
				{foreword && (
					<p className="toc-foreword">
						<Link href={`/chapters/${foreword.slug}`}>Foreword &amp; Introduction</Link> by{' '}
						<a href={site.authorUrl} {...linkProps(site.authorUrl)}>
							{site.author}
						</a>
					</p>
				)}

				<ol className="toc-chapters">
					{numbered.map((chapter) => {
						const number = getChapterNumber(chapter);
						return (
							<li key={chapter.slug} className="toc-chapter">
								<Link className="toc-chapter__link" href={`/chapters/${chapter.slug}`}>
									<span className="toc-chapter__number" aria-hidden="true">
										{number}.
									</span>
									<span className="toc-chapter__body">
										<span className="toc-chapter__title">{chapter.title}</span>
										{chapter.description && (
											<span className="toc-chapter__desc">{chapter.description}</span>
										)}
									</span>
								</Link>
							</li>
						);
					})}
				</ol>

				{backMatter.map((item) => (
					<Link
						key={item.slug}
						className="toc-foreword toc-backmatter"
						href={`/chapters/${item.slug}`}
					>
						{item.title}
					</Link>
				))}
			</nav>
		</main>
	);
}
