'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/lib/site';

const nav = [
	{ href: '/', label: 'Home', match: (p: string) => p === '/' },
	{
		href: '/table-of-contents',
		label: 'Read',
		match: (p: string) => p.startsWith('/table-of-contents') || p.startsWith('/chapters'),
	},
	{ href: '/download', label: 'Download', match: (p: string) => p.startsWith('/download') },
];

export default function SiteHeader() {
	const path = usePathname();

	return (
		<header className="site-header">
			<div className="site-header__inner">
				<Link className="site-header__brand" href="/">
					{site.title}
				</Link>
				<nav className="site-nav" aria-label="Primary">
					{nav.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							aria-current={item.match(path) ? 'page' : undefined}
						>
							{item.label}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}
