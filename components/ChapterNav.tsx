import Link from 'next/link';
import { ChevronIcon } from '@/components/icons';

type ChapterLink = { slug: string; title: string };

type Props = {
	chapters: ChapterLink[];
	currentSlug: string;
};

export default function ChapterNav({ chapters, currentSlug }: Props) {
	const index = chapters.findIndex((c) => c.slug === currentSlug);
	const prev = index > 0 ? chapters[index - 1] : null;
	const next = index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;

	return (
		<nav className="chapter-nav" aria-label="Chapter">
			{prev ? (
				<Link
					className="chapter-nav__link chapter-nav__link--prev"
					href={`/chapters/${prev.slug}`}
					aria-label={`Previous chapter: ${prev.title}`}
				>
					<span className="chapter-nav__label">
						<ChevronIcon direction="left" size="sm" />
						Previous
					</span>
					<span className="chapter-nav__title">{prev.title}</span>
				</Link>
			) : (
				<span className="chapter-nav__spacer" aria-hidden="true" />
			)}
			{next ? (
				<Link
					className="chapter-nav__link chapter-nav__link--next"
					href={`/chapters/${next.slug}`}
					aria-label={`Next chapter: ${next.title}`}
				>
					<span className="chapter-nav__label">
						Next
						<ChevronIcon direction="right" size="sm" />
					</span>
					<span className="chapter-nav__title">{next.title}</span>
				</Link>
			) : (
				<span className="chapter-nav__spacer" aria-hidden="true" />
			)}
		</nav>
	);
}
