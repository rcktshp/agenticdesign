const SEARCH_HIGHLIGHT_KEY = 'ads-reader-search-highlight';

export const READER_SEARCH_HIGHLIGHT_EVENT = 'reader-search-highlight';

export function setSearchHighlight(text: string): void {
	if (typeof window === 'undefined') return;
	sessionStorage.setItem(SEARCH_HIGHLIGHT_KEY, text);
}

export function peekSearchHighlight(): string | null {
	if (typeof window === 'undefined') return null;
	return sessionStorage.getItem(SEARCH_HIGHLIGHT_KEY);
}

export function clearSearchHighlight(): void {
	if (typeof window === 'undefined') return;
	sessionStorage.removeItem(SEARCH_HIGHLIGHT_KEY);
}
