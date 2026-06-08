import type { Metadata } from 'next';
import ReaderExperience from '@/components/ReaderExperience';
import { site } from '@/lib/site';

export const metadata: Metadata = {
	title: 'Cover',
	description: `${site.title} — book cover`,
};

export default function CoverPage() {
	return (
		<article className="chapter-layout reader-page reader-page--cover">
			<ReaderExperience
				chapterKey="cover"
				chapterLabel="Cover"
				startPage={1}
				isCover
				nextHref="/chapters/00-foreword-introduction"
				prevHref={undefined}
			>
				<div className="reader-cover-spacer" aria-hidden="true" />
				<div className="reader-cover">
					<img
						src="/images/book-cover.png"
						alt={`${site.title} book cover`}
						width={723}
						height={1024}
						className="reader-cover__image"
					/>
				</div>
			</ReaderExperience>
		</article>
	);
}
