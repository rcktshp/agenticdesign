export function isExternalUrl(href: string): boolean {
	if (!href || href.startsWith('/') || href.startsWith('#')) return false;
	try {
		const { protocol } = new URL(href);
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
}

export const externalLinkAttrs = {
	target: '_blank',
	rel: 'noopener noreferrer',
} as const;

export function linkProps(href: string) {
	return isExternalUrl(href) ? externalLinkAttrs : {};
}
