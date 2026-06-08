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
import { site } from '@/lib/site';
import {
	AppearanceIcon,
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
	ThemeSampleIcon,
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
	children: ReactNode;
};

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

export default function ReaderChrome({ chapters, children }: Props) {
	const pathname = usePathname();
	const currentSlug = getCurrentSlug(pathname);
	const shellRef = useRef<HTMLDivElement>(null);

	const [prefs, setPrefs] = useState<ReaderPreferences>(defaultReaderPreferences);
	const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);
	const [highlights, setHighlights] = useState<ReaderHighlight[]>([]);
	const [panel, setPanel] = useState<Panel>(null);
	const [appearanceMenuOpen, setAppearanceMenuOpen] = useState(false);
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
		setAppearanceMenuOpen(false);
		setSearchQuery('');
	}, [pathname]);

	useEffect(() => {
		const onChange = () => refreshAnnotations();
		window.addEventListener('reader-annotations-change', onChange);
		return () => window.removeEventListener('reader-annotations-change', onChange);
	}, [refreshAnnotations]);

	useEffect(() => {
		if (!appearanceMenuOpen) return;

		const onPointerDown = (event: MouseEvent) => {
			if (!(event.target as HTMLElement).closest('.reader-settings__appearance')) {
				setAppearanceMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', onPointerDown);
		return () => document.removeEventListener('mousedown', onPointerDown);
	}, [appearanceMenuOpen]);

	useEffect(() => {
		if (panel !== 'settings') setAppearanceMenuOpen(false);
	}, [panel]);

	useEffect(() => {
		if (!panel) return;

		const onPointerDown = (event: MouseEvent) => {
			if (!shellRef.current?.contains(event.target as Node)) {
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

	const filteredChapters = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return chapters;
		return chapters.filter(
			(chapter) =>
				chapter.title.toLowerCase().includes(query) ||
				chapter.label.toLowerCase().includes(query),
		);
	}, [chapters, searchQuery]);

	const setTheme = useCallback((theme: ReaderTheme) => {
		setPrefs((current) => ({ ...current, theme }));
	}, []);

	const setAppearance = useCallback((appearance: ReaderAppearance) => {
		setPrefs((current) => ({ ...current, appearance }));
		setAppearanceMenuOpen(false);
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
					<ul className="reader-contents">
						{filteredChapters.map((chapter) => (
							<li key={chapter.slug}>
								<Link
									href={chapter.href}
									className="reader-contents__link"
									onClick={() => setPanel(null)}
								>
									<span className="reader-contents__label">{chapter.label}</span>
									<span className="reader-contents__page">{chapter.startPage}</span>
								</Link>
							</li>
						))}
						{filteredChapters.length === 0 && (
							<li className="reader-panel__empty">No chapters match your search.</li>
						)}
					</ul>
				</div>
			)}

			{panel === 'settings' && (
				<div className="reader-panel reader-panel--settings" role="dialog" aria-label="Themes and settings">
					<p className="reader-panel__title">Themes &amp; Settings</p>

					<div className="reader-settings__row">
						<div className="reader-settings__size">
							<button
								type="button"
								className="reader-settings__size-button"
								onClick={decreaseFontSize}
								disabled={atMin}
								aria-label="Decrease text size"
							>
								<TextSizeIcon variant="decrease" />
							</button>
							<button
								type="button"
								className="reader-settings__size-button"
								onClick={increaseFontSize}
								disabled={atMax}
								aria-label="Increase text size"
							>
								<TextSizeIcon variant="increase" />
							</button>
						</div>
						<div className="reader-settings__appearance">
							<button
								type="button"
								className="reader-settings__appearance-trigger"
								aria-label="Appearance"
								aria-expanded={appearanceMenuOpen}
								aria-haspopup="menu"
								data-active={appearanceMenuOpen ? 'true' : undefined}
								onClick={() => setAppearanceMenuOpen((open) => !open)}
							>
								<AppearanceIcon />
							</button>
							{appearanceMenuOpen && (
								<div className="reader-appearance-menu" role="menu" aria-label="Appearance">
									{READER_APPEARANCE_OPTIONS.map((option) => (
										<button
											key={option.id}
											type="button"
											className="reader-appearance-menu__option"
											role="menuitemradio"
											aria-checked={prefs.appearance === option.id}
											data-active={prefs.appearance === option.id ? 'true' : undefined}
											onClick={() => setAppearance(option.id)}
										>
											<span className="reader-appearance-menu__icon" aria-hidden="true">
												{option.id === 'light' && <LightModeIcon />}
												{option.id === 'dark' && <DarkModeIcon />}
												{option.id === 'system' && <SystemModeIcon />}
											</span>
											<span>{option.label}</span>
											{prefs.appearance === option.id && (
												<CheckIcon className="reader-appearance-menu__check" />
											)}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

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
							>
								<ThemeSampleIcon className="reader-theme__sample" />
								<span className="reader-theme__label">{theme.label}</span>
							</button>
						))}
					</div>
				</div>
			)}

			{children}
		</div>
	);
}
