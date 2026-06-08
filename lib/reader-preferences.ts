export type ReaderTheme = 'original' | 'quiet' | 'paper' | 'bold' | 'calm' | 'focus';

export type ReaderAppearance = 'light' | 'dark' | 'system';

export type ReaderLayoutMode = 'pages' | 'scroll';

export type ReaderPreferences = {
	theme: ReaderTheme;
	appearance: ReaderAppearance;
	fontSize: number;
	layoutMode: ReaderLayoutMode;
};

export const READER_STORAGE_KEY = 'ads-reader-preferences';

export const FONT_SIZE_MIN = 0;
export const FONT_SIZE_MAX = 4;
export const FONT_SIZE_DEFAULT = 2;

export const FONT_SIZE_SCALES = [0.88, 0.94, 1, 1.08, 1.16] as const;

export const READER_THEME_OPTIONS = [
	{ id: 'original', label: 'Original' },
	{ id: 'quiet', label: 'Quiet' },
	{ id: 'paper', label: 'Paper' },
	{ id: 'bold', label: 'Bold' },
	{ id: 'calm', label: 'Calm' },
	{ id: 'focus', label: 'Focus' },
] as const satisfies ReadonlyArray<{ id: ReaderTheme; label: string }>;

export const READER_APPEARANCE_OPTIONS = [
	{ id: 'light', label: 'Light' },
	{ id: 'dark', label: 'Dark' },
	{ id: 'system', label: 'Automatic' },
] as const satisfies ReadonlyArray<{ id: ReaderAppearance; label: string }>;

const VALID_THEMES = new Set<string>([
	'original',
	'quiet',
	'paper',
	'bold',
	'calm',
	'focus',
	'system',
]);

const VALID_APPEARANCES = new Set<string>(['light', 'dark', 'system']);

const LEGACY_THEMES: Record<string, ReaderTheme> = {
	light: 'original',
	dark: 'quiet',
};

export const defaultReaderPreferences: ReaderPreferences = {
	theme: 'original',
	appearance: 'light',
	fontSize: FONT_SIZE_DEFAULT,
	layoutMode: 'pages',
};

function normalizeLayoutMode(value: unknown): ReaderLayoutMode {
	return value === 'scroll' ? 'scroll' : 'pages';
}

export function clampFontSize(value: number): number {
	return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, value));
}

export function getFontScale(fontSize: number): number {
	return FONT_SIZE_SCALES[clampFontSize(fontSize)];
}

export function normalizeTheme(theme: unknown): ReaderTheme {
	if (typeof theme === 'string' && theme in LEGACY_THEMES) {
		return LEGACY_THEMES[theme];
	}
	if (typeof theme === 'string' && theme === 'system') {
		return 'original';
	}
	if (typeof theme === 'string' && VALID_THEMES.has(theme) && theme !== 'system') {
		return theme as ReaderTheme;
	}
	return defaultReaderPreferences.theme;
}

export function normalizeAppearance(
	appearance: unknown,
	legacyTheme?: unknown,
): ReaderAppearance {
	if (typeof appearance === 'string' && VALID_APPEARANCES.has(appearance)) {
		return appearance as ReaderAppearance;
	}
	if (legacyTheme === 'system') return 'system';
	if (legacyTheme === 'dark' || legacyTheme === 'quiet') return 'dark';
	if (legacyTheme === 'light' || legacyTheme === 'original') return 'light';
	return defaultReaderPreferences.appearance;
}

export function parseReaderPreferences(raw: string | null): ReaderPreferences {
	if (!raw) return defaultReaderPreferences;

	try {
		const parsed = JSON.parse(raw) as Partial<ReaderPreferences> & { theme?: string };
		return {
			theme: normalizeTheme(parsed.theme),
			appearance: normalizeAppearance(parsed.appearance, parsed.theme),
			fontSize: clampFontSize(Number(parsed.fontSize ?? FONT_SIZE_DEFAULT)),
			layoutMode: normalizeLayoutMode(parsed.layoutMode),
		};
	} catch {
		return defaultReaderPreferences;
	}
}

export function loadReaderPreferences(): ReaderPreferences {
	if (typeof window === 'undefined') return defaultReaderPreferences;
	return parseReaderPreferences(localStorage.getItem(READER_STORAGE_KEY));
}

export function saveReaderPreferences(prefs: ReaderPreferences): void {
	localStorage.setItem(READER_STORAGE_KEY, JSON.stringify(prefs));
}

export function applyReaderPreferences(prefs: ReaderPreferences): void {
	const root = document.documentElement;
	root.dataset.readerTheme = prefs.theme;
	root.dataset.readerAppearance = prefs.appearance;
	root.dataset.readerFontSize = String(prefs.fontSize);
	root.dataset.readerLayout = prefs.layoutMode;
	root.style.setProperty('--reader-font-scale', String(getFontScale(prefs.fontSize)));
}
