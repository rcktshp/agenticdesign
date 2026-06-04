import Link from 'next/link';

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
				<Link href={`/chapters/${prev.slug}`}>← {prev.title}</Link>
			) : (
				<span />
			)}
			{next ? (
				<Link href={`/chapters/${next.slug}`}>{next.title} →</Link>
			) : (
				<span />
			)}
		</nav>
	);
}
