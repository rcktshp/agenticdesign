import Link from 'next/link';
import { site } from '@/lib/site';

export default function HomePage() {
	return (
		<main className="hero">
			<img
				className="hero__cover"
				src="/images/book-cover.svg"
				alt={`${site.title} book cover`}
				width={320}
				height={440}
			/>
			<div>
				<h1>
					<cite>{site.title}</cite>
				</h1>
				<p className="hero__kicker">{site.kicker}</p>
				<p className="hero__lead">{site.tagline}</p>
				<p>{site.description}</p>
				<p>{site.readOnlineNote}</p>
				<div className="btn-group">
					<Link className="btn" href="/download">
						Order ebook
					</Link>
					<Link className="btn btn--ghost" href="/table-of-contents">
						Read now
					</Link>
				</div>
			</div>
		</main>
	);
}
