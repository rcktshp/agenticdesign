'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import {
	formatBookmarkDate,
	loadBookmarks,
	loadHighlights,
	removeBookmark,
	removeHighlight,
	toggleBookmark,
	type ReaderBookmark,
	type ReaderHighlight,
} from '@/lib/reader-annotations';
import {
	applyReaderPreferences,
	clampFontSize,
	defaultReaderPreferences,
	FONT_SIZE_MAX,
	FONT_SIZE_MIN,
	loadReaderPreferences,
	READER_APPEARANCE_OPTIONS,
	READER_THEME_OPTIONS,
	saveReaderPreferences,
	type ReaderAppearance,
	type ReaderLayoutMode,
	type ReaderPreferences,
	type ReaderTheme,
} from '@/lib/reader-preferences';
import { searchBook, type BookSearchChapter, type BookSearchResult } from '@/lib/book-search';
import { setSearchHighlight } from '@/lib/reader-search-highlight';
import { site } from '@/lib/site';
import {
	BookmarkIcon,
	BookmarkMenuIcon,
	CheckIcon,
	CloseIcon,
	DarkModeIcon,
	HighlightsIcon,
	HomeIcon,
	LightModeIcon,
	ListIcon,
	PagesIcon,
	ScrollIcon,
	SearchIcon,
	SystemModeIcon,
	TextSizeIcon,
} from '@/components/icons';

export type ReaderChapter = {
	slug: string;
	title: string;
	label: string;
	order: number;
	startPage: number;
	href: string;
};

type Panel = 'contents' | 'bookmarks' | 'highlights' | 'settings' | 'search' | null;

type Props = {
	chapters: ReaderChapter[];
	searchIndex: BookSearchChapter[];
	children: ReactNode;
};

function highlightSnippet(snippet: string, query: string): ReactNode {
	const normalizedQuery = query.trim();
	if (!normalizedQuery) return snippet;

	const lowerSnippet = snippet.toLowerCase();
	const lowerQuery = normalizedQuery.toLowerCase();
	const index = lowerSnippet.indexOf(lowerQuery);
	if (index === -1) return snippet;

	return (
		<>
			{snippet.slice(0, index)}
			<mark className="reader-search-results__mark">{snippet.slice(index, index + normalizedQuery.length)}</mark>
			{snippet.slice(index + normalizedQuery.length)}
		</>
	);
}

function getCurrentSlug(pathname: string): string | null {
	if (pathname === '/cover') return 'cover';
	const match = pathname.match(/^\/chapters\/([^/]+)/);
	return match?.[1] ?? null;
}

function isContentsActive(
	chapter: ReaderChapter,
	pathname: string,
	currentSlug: string | null,
): boolean {
	if (chapter.slug === 'cover') return pathname === '/cover';
	return chapter.slug === currentSlug;
}

export default function ReaderChrome({ chapters, searchIndex, children }: Props) {
	const pathname = usePathname();
	const currentSlug = getCurrentSlug(pathname);
	const shellRef = useRef<HTMLDivElement>(null);

	const [prefs, setPrefs] = useState<ReaderPreferences>(defaultReaderPreferences);
	const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);
	const [highlights, setHighlights] = useState<ReaderHighlight[]>([]);
	const [panel, setPanel] = useState<Panel>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [ready, setReady] = useState(false);

	const refreshAnnotations = useCallback(() => {
		setBookmarks(loadBookmarks());
		setHighlights(loadHighlights());
	}, []);

	useEffect(() => {
		setPrefs(loadReaderPreferences());
		refreshAnnotations();
		setReady(true);
	}, [refreshAnnotations]);

	useEffect(() => {
		if (!ready) return;
		document.documentElement.classList.add('is-reading');
		return () => {
			document.documentElement.classList.remove('is-reading');
			delete document.documentElement.dataset.readerTheme;
			delete document.documentElement.dataset.readerAppearance;
			delete document.documentElement.dataset.readerFontSize;
			delete document.documentElement.dataset.readerLayout;
			document.documentElement.style.removeProperty('--reader-font-scale');
		};
	}, [ready]);

	useEffect(() => {
		if (!ready) return;
		applyReaderPreferences(prefs);
		saveReaderPreferences(prefs);
	}, [prefs, ready]);

	useEffect(() => {
		setPanel(null);
		setSearchQuery('');
	}, [pathname]);

	useEffect(() => {
		const onChange = () => refreshAnnotations();
		window.addEventListener('reader-annotations-change', onChange);
		return () => window.removeEventListener('reader-annotations-change', onChange);
	}, [refreshAnnotations]);

	useEffect(() => {
		if (!panel) return;

		const onPointerDown = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (target instanceof Element && target.closest('.reader-chrome__pill-button, .reader-chrome__button')) {
				return;
			}
			if (!shellRef.current?.contains(target)) {
				setPanel(null);
			}
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setPanel(null);
		};

		document.addEventListener('mousedown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('mousedown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [panel]);

	const chapterBySlug = useMemo(
		() => new Map(chapters.map((chapter) => [chapter.slug, chapter])),
		[chapters],
	);

	const searchResults = useMemo(
		() => searchBook(searchIndex, searchQuery),
		[searchIndex, searchQuery],
	);

	const onSearchResultClick = useCallback(
		(result: BookSearchResult) => {
			setSearchHighlight(result.matchText);
			setPanel(null);
			if (currentSlug === result.slug) {
				window.dispatchEvent(new CustomEvent('reader-search-highlight'));
			}
		},
		[currentSlug],
	);

	const setTheme = useCallback((theme: ReaderTheme) => {
		setPrefs((current) => ({
			...current,
			theme,
			appearance: theme === 'quiet' ? 'dark' : current.appearance,
		}));
	}, []);

	const setAppearance = useCallback((appearance: ReaderAppearance) => {
		setPrefs((current) => ({ ...current, appearance }));
	}, []);

	const setLayoutMode = useCallback((layoutMode: ReaderLayoutMode) => {
		setPrefs((current) => ({ ...current, layoutMode }));
	}, []);

	const decreaseFontSize = useCallback(() => {
		setPrefs((current) => ({
			...current,
			fontSize: clampFontSize(current.fontSize - 1),
		}));
	}, []);

	const increaseFontSize = useCallback(() => {
		setPrefs((current) => ({
			...current,
			fontSize: clampFontSize(current.fontSize + 1),
		}));
	}, []);

	const onToggleBookmark = useCallback(() => {
		if (!currentSlug) return;
		const chapter = chapterBySlug.get(currentSlug);
		if (!chapter) return;
		setBookmarks(
			toggleBookmark({
				slug: currentSlug,
				label: chapter.label,
				page: chapter.startPage,
			}),
		);
	}, [chapterBySlug, currentSlug]);

	const isBookmarked = currentSlug ? bookmarks.some((b) => b.slug === currentSlug) : false;
	const atMin = prefs.fontSize <= FONT_SIZE_MIN;
	const atMax = prefs.fontSize >= FONT_SIZE_MAX;

	const sortedBookmarks = useMemo(
		() =>
			[...bookmarks].sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			),
		[bookmarks],
	);

	const sortedHighlights = useMemo(
		() =>
			[...highlights].sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			),
		[highlights],
	);

	return (
		<div className="reader-shell" ref={shellRef}>
			<header className="reader-header">
				<div className="reader-chrome" role="toolbar" aria-label="Reader controls">
					<div className="reader-chrome__left">
					<div className="reader-chrome__pill reader-chrome__pill--nav">
						<Link
							href="/"
							className="reader-chrome__pill-button reader-chrome__pill-button--link"
							aria-label="Home"
							aria-current={pathname === '/' ? 'page' : undefined}
							data-active={pathname === '/' ? 'true' : undefined}
						>
							<HomeIcon />
						</Link>

						<button
							type="button"
							className="reader-chrome__pill-button"
							aria-label="Table of contents"
							aria-expanded={panel === 'contents'}
							data-active={panel === 'contents' ? 'true' : undefined}
							onClick={() => setPanel((current) => (current === 'contents' ? null : 'contents'))}
						>
							<ListIcon />
						</button>

						<button
							type="button"
							className="reader-chrome__pill-button"
							aria-label="Bookmarks"
							aria-expanded={panel === 'bookmarks'}
							data-active={panel === 'bookmarks' ? 'true' : undefined}
							onClick={() => setPanel((current) => (current === 'bookmarks' ? null : 'bookmarks'))}
						>
							<BookmarkMenuIcon />
						</button>

						<button
							type="button"
							className="reader-chrome__pill-button"
							aria-label="Highlights and notes"
							aria-expanded={panel === 'highlights'}
							data-active={panel === 'highlights' ? 'true' : undefined}
							onClick={() => setPanel((current) => (current === 'highlights' ? null : 'highlights'))}
						>
							<HighlightsIcon />
						</button>
					</div>
				</div>

				<p className="reader-chrome__title">
					{site.title} by {site.authorShortName}
				</p>

				<div className="reader-chrome__right">
					<div className="reader-chrome__pill">
						<button
							type="button"
							className="reader-chrome__pill-button"
							aria-label="Themes and settings"
							aria-expanded={panel === 'settings'}
							data-active={panel === 'settings' ? 'true' : undefined}
							onClick={() => setPanel((current) => (current === 'settings' ? null : 'settings'))}
						>
							<TextSizeIcon />
						</button>
						<button
							type="button"
							className="reader-chrome__pill-button"
							aria-label="Search chapters"
							aria-expanded={panel === 'search'}
							data-active={panel === 'search' ? 'true' : undefined}
							onClick={() => setPanel((current) => (current === 'search' ? null : 'search'))}
						>
							<SearchIcon />
						</button>
					</div>

					<button
						type="button"
						className="reader-chrome__button reader-chrome__button--bookmark"
						aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
						aria-pressed={isBookmarked}
						data-active={isBookmarked ? 'true' : undefined}
						onClick={onToggleBookmark}
					>
						<BookmarkIcon filled={isBookmarked} />
					</button>
				</div>
			</div>
			</header>

			{panel === 'contents' && (
				<div className="reader-panel reader-panel--contents" role="dialog" aria-label="Contents">
					<p className="reader-panel__title">Contents</p>
					<div className="reader-contents__layout" role="group" aria-label="Reading layout">
						<button
							type="button"
							className="reader-settings__layout-button"
							data-active={prefs.layoutMode === 'pages' ? 'true' : undefined}
							aria-pressed={prefs.layoutMode === 'pages'}
							onClick={() => setLayoutMode('pages')}
						>
							<PagesIcon size="sm" />
							Pages
						</button>
						<button
							type="button"
							className="reader-settings__layout-button"
							data-active={prefs.layoutMode === 'scroll' ? 'true' : undefined}
							aria-pressed={prefs.layoutMode === 'scroll'}
							onClick={() => setLayoutMode('scroll')}
						>
							<ScrollIcon size="sm" />
							Scroll
						</button>
					</div>
					<ul className="reader-contents">
						{chapters.map((chapter) => (
							<li key={chapter.slug}>
								<Link
									href={chapter.href}
									className="reader-contents__link"
									data-active={
										isContentsActive(chapter, pathname, currentSlug) ? 'true' : undefined
									}
									onClick={() => setPanel(null)}
								>
									<span className="reader-contents__label">{chapter.label}</span>
									<span className="reader-contents__page">{chapter.startPage}</span>
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}

			{panel === 'bookmarks' && (
				<div className="reader-panel reader-panel--bookmarks" role="dialog" aria-label="Bookmarks">
					<p className="reader-panel__title">Bookmarks</p>
					{sortedBookmarks.length === 0 ? (
						<p className="reader-panel__empty">
							No bookmarks yet. Tap the bookmark icon to save your place.
						</p>
					) : (
						<ul className="reader-bookmarks">
							{sortedBookmarks.map((bookmark) => {
								const chapter = chapterBySlug.get(bookmark.slug);
								const href = chapter?.href ?? `/chapters/${bookmark.slug}`;
								return (
									<li key={bookmark.id}>
										<Link
											href={href}
											className="reader-bookmarks__link"
											data-active={bookmark.slug === currentSlug ? 'true' : undefined}
											onClick={() => setPanel(null)}
										>
											<span className="reader-bookmarks__body">
												<span className="reader-bookmarks__label">{bookmark.label}</span>
												<span className="reader-bookmarks__date">
													{formatBookmarkDate(bookmark.createdAt)}
												</span>
											</span>
											<span className="reader-bookmarks__page">{bookmark.page}</span>
										</Link>
										<button
											type="button"
											className="reader-bookmarks__remove"
											aria-label={`Remove bookmark for ${bookmark.label}`}
											onClick={() => setBookmarks(removeBookmark(bookmark.id))}
										>
											<CloseIcon />
											Remove
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			)}

			{panel === 'highlights' && (
				<div className="reader-panel reader-panel--highlights" role="dialog" aria-label="Highlights and notes">
					<p className="reader-panel__title">Highlights &amp; Notes</p>
					{sortedHighlights.length === 0 ? (
						<div className="reader-panel__empty-state">
							<p className="reader-panel__empty-title">No Highlights or Notes</p>
							<p className="reader-panel__empty">
								Select text in the book, then choose a highlight color or add a note.
							</p>
						</div>
					) : (
						<ul className="reader-highlights">
							{sortedHighlights.map((highlight) => {
								const chapter = chapterBySlug.get(highlight.slug);
								const href = chapter?.href ?? `/chapters/${highlight.slug}`;
								return (
									<li key={highlight.id} className="reader-highlights__item">
										<Link
											href={href}
											className="reader-highlights__link"
											onClick={() => setPanel(null)}
										>
											<span
												className={`reader-highlights__swatch reader-highlights__swatch--${highlight.color}`}
												aria-hidden="true"
											/>
											<span className="reader-highlights__body">
												<span className="reader-highlights__chapter">
													{chapter?.label ?? highlight.slug}
												</span>
												<span className="reader-highlights__text">&ldquo;{highlight.text}&rdquo;</span>
												{highlight.note && (
													<span className="reader-highlights__note">{highlight.note}</span>
												)}
											</span>
										</Link>
										<button
											type="button"
											className="reader-highlights__remove"
											aria-label="Remove highlight"
											onClick={() => setHighlights(removeHighlight(highlight.id))}
										>
											<CloseIcon />
											Remove
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			)}

			{panel === 'search' && (
				<div className="reader-panel reader-panel--search" role="dialog" aria-label="Search">
					<label className="reader-search">
						<SearchIcon size="sm" />
						<input
							type="search"
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="In this book"
							autoFocus
						/>
					</label>
					{searchQuery.trim().length < 2 ? (
						<p className="reader-panel__empty">Type at least 2 characters to search the book.</p>
					) : (
						<ul className="reader-search-results">
							{searchResults.map((result, index) => (
								<li key={`${result.slug}-${index}`}>
									<Link
										href={result.href}
										className="reader-search-results__link"
										onClick={() => onSearchResultClick(result)}
									>
										<span className="reader-search-results__meta">
											<span className="reader-search-results__chapter">{result.label}</span>
											<span className="reader-search-results__page">{result.startPage}</span>
										</span>
										<span className="reader-search-results__snippet">
											{highlightSnippet(result.snippet, searchQuery)}
										</span>
									</Link>
								</li>
							))}
							{searchResults.length === 0 && (
								<li className="reader-panel__empty">No results found in this book.</li>
							)}
						</ul>
					)}
				</div>
			)}

			{panel === 'settings' && (
				<div className="reader-panel reader-panel--settings" role="dialog" aria-label="Themes and settings">
					<p className="reader-panel__title">Themes &amp; Settings</p>

					<div className="reader-settings">
						<section className="reader-settings__section">
							<h3 className="reader-settings__heading">Text size</h3>
							<div className="reader-settings__size">
								<button
									type="button"
									className="reader-settings__size-button reader-settings__size-button--decrease"
									onClick={decreaseFontSize}
									disabled={atMin}
									aria-label="Decrease text size"
								>
									<span className="reader-settings__size-label" aria-hidden="true">
										a
									</span>
								</button>
								<button
									type="button"
									className="reader-settings__size-button reader-settings__size-button--increase"
									onClick={increaseFontSize}
									disabled={atMax}
									aria-label="Increase text size"
								>
									<span className="reader-settings__size-label" aria-hidden="true">
										A
									</span>
								</button>
							</div>
						</section>

						<section className="reader-settings__section">
							<h3 className="reader-settings__heading">Appearance</h3>
							<div className="reader-settings__segmented" role="group" aria-label="Appearance">
								{READER_APPEARANCE_OPTIONS.map((option) => (
									<button
										key={option.id}
										type="button"
										className="reader-settings__segmented-button"
										aria-pressed={prefs.appearance === option.id}
										data-active={prefs.appearance === option.id ? 'true' : undefined}
										onClick={() => setAppearance(option.id)}
									>
										<span className="reader-settings__segmented-icon" aria-hidden="true">
											{option.id === 'light' && <LightModeIcon size="sm" />}
											{option.id === 'dark' && <DarkModeIcon size="sm" />}
											{option.id === 'system' && <SystemModeIcon size="sm" />}
										</span>
										<span>{option.label}</span>
									</button>
								))}
							</div>
						</section>

						<section className="reader-settings__section">
							<h3 className="reader-settings__heading">Layout</h3>
							<div className="reader-settings__segmented" role="group" aria-label="Reading layout">
								<button
									type="button"
									className="reader-settings__segmented-button"
									data-active={prefs.layoutMode === 'scroll' ? 'true' : undefined}
									aria-pressed={prefs.layoutMode === 'scroll'}
									onClick={() => setLayoutMode('scroll')}
								>
									<ScrollIcon size="sm" />
									Scroll
								</button>
								<button
									type="button"
									className="reader-settings__segmented-button"
									data-active={prefs.layoutMode === 'pages' ? 'true' : undefined}
									aria-pressed={prefs.layoutMode === 'pages'}
									onClick={() => setLayoutMode('pages')}
								>
									<PagesIcon size="sm" />
									Pages
								</button>
							</div>
						</section>

						<section className="reader-settings__section">
							<h3 className="reader-settings__heading">Theme</h3>
							<div className="reader-themes">
								{READER_THEME_OPTIONS.map((theme) => (
									<button
										key={theme.id}
										type="button"
										className="reader-theme"
										data-theme={theme.id}
										data-active={prefs.theme === theme.id ? 'true' : undefined}
										onClick={() => setTheme(theme.id)}
										aria-pressed={prefs.theme === theme.id}
										aria-label={`${theme.label} theme`}
									>
										<span className="reader-theme__sample" aria-hidden="true">
											Aa
										</span>
										<span className="reader-theme__label">{theme.label}</span>
										{prefs.theme === theme.id && (
											<CheckIcon className="reader-theme__check" aria-hidden="true" />
										)}
									</button>
								))}
							</div>
						</section>
					</div>
				</div>
			)}

			{children}
		</div>
	);
}
