'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ListIcon } from '@/components/icons';
import { site } from '@/lib/site';

const nav = [
	{ href: '/', label: 'Home', icon: HomeIcon, match: (p: string) => p === '/' },
	{
		href: '/table-of-contents',
		label: 'Read',
		icon: ListIcon,
		match: (p: string) => p.startsWith('/table-of-contents') || p.startsWith('/chapters'),
	},
] as const;

export default function SiteHeader() {
	const path = usePathname();

	return (
		<header className="site-header">
			<div className="site-header__inner">
				<Link className="site-header__brand" href="/">
					{site.title}
				</Link>
				<nav className="site-nav" aria-label="Primary">
					{nav.map((item) => {
						const Icon = item.icon;
						return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={item.match(path) ? 'page' : undefined}
						>
							<Icon size="sm" />
							{item.label}
						</Link>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
