export const BOOKMARKS_STORAGE_KEY = 'ads-reader-bookmarks';
export const HIGHLIGHTS_STORAGE_KEY = 'ads-reader-highlights';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export type ReaderBookmark = {
	id: string;
	slug: string;
	label: string;
	page: number;
	createdAt: string;
};

export type ReaderHighlight = {
	id: string;
	slug: string;
	text: string;
	color: HighlightColor;
	note?: string;
	createdAt: string;
};

export const HIGHLIGHT_COLORS: { id: HighlightColor; label: string }[] = [
	{ id: 'yellow', label: 'Yellow' },
	{ id: 'green', label: 'Green' },
	{ id: 'blue', label: 'Blue' },
	{ id: 'pink', label: 'Pink' },
	{ id: 'purple', label: 'Purple' },
];

function createId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseBookmarks(raw: string | null): ReaderBookmark[] {
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw) as unknown;

		if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
			return parsed.map((slug) => ({
				id: createId(),
				slug,
				label: slug,
				page: 1,
				createdAt: new Date().toISOString(),
			}));
		}

		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter(
				(item): item is ReaderBookmark =>
					typeof item === 'object' &&
					item !== null &&
					typeof (item as ReaderBookmark).slug === 'string' &&
					typeof (item as ReaderBookmark).label === 'string',
			)
			.map((item) => ({
				id: item.id ?? createId(),
				slug: item.slug,
				label: item.label,
				page: Number(item.page) || 1,
				createdAt: item.createdAt ?? new Date().toISOString(),
			}));
	} catch {
		return [];
	}
}

function parseHighlights(raw: string | null): ReaderHighlight[] {
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter(
				(item): item is ReaderHighlight =>
					typeof item === 'object' &&
					item !== null &&
					typeof (item as ReaderHighlight).slug === 'string' &&
					typeof (item as ReaderHighlight).text === 'string',
			)
			.map((item) => ({
				id: item.id ?? createId(),
				slug: item.slug,
				text: item.text,
				color: normalizeHighlightColor(item.color),
				note: typeof item.note === 'string' ? item.note : undefined,
				createdAt: item.createdAt ?? new Date().toISOString(),
			}));
	} catch {
		return [];
	}
}

function normalizeHighlightColor(value: unknown): HighlightColor {
	if (typeof value === 'string' && HIGHLIGHT_COLORS.some((color) => color.id === value)) {
		return value as HighlightColor;
	}
	return 'yellow';
}

export function loadBookmarks(): ReaderBookmark[] {
	if (typeof window === 'undefined') return [];
	return parseBookmarks(localStorage.getItem(BOOKMARKS_STORAGE_KEY));
}

export function saveBookmarks(bookmarks: ReaderBookmark[]): void {
	localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
	dispatchAnnotationsChange();
}

export function loadHighlights(): ReaderHighlight[] {
	if (typeof window === 'undefined') return [];
	return parseHighlights(localStorage.getItem(HIGHLIGHTS_STORAGE_KEY));
}

export function saveHighlights(highlights: ReaderHighlight[]): void {
	localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(highlights));
	dispatchAnnotationsChange();
}

export function dispatchAnnotationsChange(): void {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent('reader-annotations-change'));
}

export function isBookmarked(slug: string): boolean {
	return loadBookmarks().some((bookmark) => bookmark.slug === slug);
}

export function toggleBookmark(entry: {
	slug: string;
	label: string;
	page: number;
}): ReaderBookmark[] {
	const bookmarks = loadBookmarks();
	const existing = bookmarks.find((bookmark) => bookmark.slug === entry.slug);

	if (existing) {
		const next = bookmarks.filter((bookmark) => bookmark.slug !== entry.slug);
		saveBookmarks(next);
		return next;
	}

	const next = [
		{
			id: createId(),
			slug: entry.slug,
			label: entry.label,
			page: entry.page,
			createdAt: new Date().toISOString(),
		},
		...bookmarks,
	];
	saveBookmarks(next);
	return next;
}

export function removeBookmark(id: string): ReaderBookmark[] {
	const next = loadBookmarks().filter((bookmark) => bookmark.id !== id);
	saveBookmarks(next);
	return next;
}

export function addHighlight(entry: {
	slug: string;
	text: string;
	color: HighlightColor;
	note?: string;
}): ReaderHighlight[] {
	const trimmed = entry.text.trim();
	if (!trimmed) return loadHighlights();

	const next = [
		{
			id: createId(),
			slug: entry.slug,
			text: trimmed,
			color: entry.color,
			note: entry.note?.trim() || undefined,
			createdAt: new Date().toISOString(),
		},
		...loadHighlights(),
	];
	saveHighlights(next);
	return next;
}

export function removeHighlight(id: string): ReaderHighlight[] {
	const next = loadHighlights().filter((highlight) => highlight.id !== id);
	saveHighlights(next);
	return next;
}

export function formatBookmarkDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';

	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const diffDays = Math.round(
		(startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';

	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
	});
}
