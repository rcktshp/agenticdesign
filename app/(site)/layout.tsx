import SiteHeader from '@/components/SiteHeader';
import { site } from '@/lib/site';
import { linkProps } from '@/lib/links';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SiteHeader />
			<div className="site-main">{children}</div>
			<footer className="site-footer">
				<p>
					<cite>{site.title}</cite> by{' '}
					<a href={site.authorUrl} {...linkProps(site.authorUrl)}>
						{site.author}
					</a>
					. Read free online; donate to download.
				</p>
			</footer>
		</>
	);
}
