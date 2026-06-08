import Link from 'next/link';
import { ListIcon } from '@/components/icons';
import { site } from '@/lib/site';

export default function HomePage() {
	return (
		<main className="hero">
			<img
				className="hero__cover"
				src="/images/book-cover.png"
				alt={`${site.title} book cover`}
				width={723}
				height={1024}
			/>
			<div>
				<h1>
					<cite>{site.title}</cite>
				</h1>
				<p className="hero__lead">{site.tagline}</p>
				<p>{site.description}</p>
				<p>{site.readOnlineNote}</p>
				<div className="btn-group">
					<Link className="btn" href="/cover">
						<ListIcon size="sm" />
						Read now
					</Link>
				</div>
			</div>
		</main>
	);
}
