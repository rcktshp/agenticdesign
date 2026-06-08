const NAV_INTENT_KEY = 'ads-reader-nav-intent';

export type ReaderNavIntent = 'start' | 'last';

/** Remember where to land after a cross-chapter route change. */
export function setReaderNavIntent(intent: ReaderNavIntent): void {
	if (typeof window === 'undefined') return;
	sessionStorage.setItem(NAV_INTENT_KEY, intent);
}

/** Read pending navigation intent without clearing it. */
export function peekReaderNavIntent(): ReaderNavIntent {
	if (typeof window === 'undefined') return 'start';
	const value = sessionStorage.getItem(NAV_INTENT_KEY);
	return value === 'last' ? 'last' : 'start';
}

/** Clear a pending navigation intent after it has been applied. */
export function clearReaderNavIntent(): void {
	if (typeof window === 'undefined') return;
	sessionStorage.removeItem(NAV_INTENT_KEY);
}

/** @deprecated Prefer peekReaderNavIntent + clearReaderNavIntent after layout is ready. */
export function consumeReaderNavIntent(): ReaderNavIntent {
	const intent = peekReaderNavIntent();
	clearReaderNavIntent();
	return intent;
}
