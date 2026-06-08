'use client';

import { useRouter } from 'next/navigation';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { ChevronIcon } from '@/components/icons';
import {
	clearReaderNavIntent,
	peekReaderNavIntent,
	setReaderNavIntent,
} from '@/lib/reader-navigation';

type Props = {
	chapterKey: string;
	chapterLabel?: string;
	startPage: number;
	isCover?: boolean;
	nextHref?: string;
	prevHref?: string;
	children: ReactNode;
};
const SPREAD_MEDIA_QUERY = '(min-width: 84rem)';

const SWIPE_THRESHOLD_PX = 48;
const SWIPE_RESTRAINT_PX = 80;

/** Two-page spread when the viewport can fit two 600px-min pages. */
export function isSpreadLayout(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia(SPREAD_MEDIA_QUERY).matches;
}

function readColumnsPerSpread(paginator: Element | null): number {
	if (!(paginator instanceof HTMLElement)) return 1;
	const value = getComputedStyle(paginator).getPropertyValue('--reader-columns-per-spread').trim();
	return value === '2' ? 2 : 1;
}

function getSpreadMetrics(flow: HTMLElement, scroller: HTMLElement, isCover: boolean) {
	const paginator = flow.closest('.reader-paginator');
	const styles = getComputedStyle(flow);
	const columnWidth = parseFloat(styles.columnWidth) || scroller.clientWidth;
	const gap = parseFloat(styles.columnGap) || 0;
	const columnsPerSpread = readColumnsPerSpread(paginator);
	const spreadWidth =
		columnsPerSpread === 1
			? columnWidth + gap
			: columnsPerSpread * columnWidth + gap;
	const pageStep = columnWidth + gap;
	const totalColumns = Math.max(1, Math.round((flow.scrollWidth + gap) / pageStep));
	const spreadCount = isCover ? 1 : Math.ceil(totalColumns / columnsPerSpread);

	return { columnWidth, gap, pageStep, spreadWidth, totalColumns, columnsPerSpread, spreadCount };
}

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function formatChapterStatus(pagesLeft: number): string {
	if (pagesLeft <= 0) return 'Last page in chapter';
	if (pagesLeft === 1) return '1 page left in chapter';
	return `${pagesLeft} pages left in chapter`;
}

export default function ReaderPaginator({
	chapterKey,
	chapterLabel,
	startPage,
	isCover = false,
	nextHref,
	prevHref,
	children,
}: Props) {
	const router = useRouter();
	const paginatorRef = useRef<HTMLDivElement>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);
	const flowRef = useRef<HTMLDivElement>(null);
	const spreadIndexRef = useRef(0);
	const spreadCountRef = useRef(1);
	const prevHrefRef = useRef(prevHref);
	const nextHrefRef = useRef(nextHref);
	const touchStartRef = useRef<{ x: number; y: number } | null>(null);
	const navIntentRef = useRef<'start' | 'last'>('start');
	const pendingNavIntentRef = useRef(true);
	const readyRef = useRef(false);

	const [spreadIndex, setSpreadIndex] = useState(0);
	const [spreadCount, setSpreadCount] = useState(1);
	const [columnsPerSpread, setColumnsPerSpread] = useState(1);
	const [totalColumns, setTotalColumns] = useState(1);
	const [ready, setReady] = useState(false);

	const goToSpread = useCallback(
		(targetIndex: number, behavior: ScrollBehavior = 'smooth') => {
			const flow = flowRef.current;
			const scroller = scrollerRef.current;
			if (!flow || !scroller || isCover) return;

			const metrics = getSpreadMetrics(flow, scroller, isCover);
			const clamped = Math.max(0, Math.min(targetIndex, metrics.spreadCount - 1));
			const offset =
				clamped === 0 ? 0 : clamped * (scroller.clientWidth || metrics.spreadWidth);

			const prefersReducedMotion = window.matchMedia(
				'(prefers-reduced-motion: reduce)',
			).matches;

			scroller.scrollTo({
				left: offset,
				behavior: prefersReducedMotion ? 'auto' : behavior,
			});
			spreadIndexRef.current = clamped;
			setSpreadIndex(clamped);
		},
		[isCover],
	);

	const applyPendingNavIntent = useCallback(() => {
		if (isCover) {
			pendingNavIntentRef.current = false;
			clearReaderNavIntent();
			return;
		}

		const flow = flowRef.current;
		const scroller = scrollerRef.current;
		if (!flow || !scroller) return;

		const metrics = getSpreadMetrics(flow, scroller, isCover);
		if (metrics.spreadCount < 1) return;

		const intent = navIntentRef.current;
		const target = intent === 'last' ? Math.max(0, metrics.spreadCount - 1) : 0;

		goToSpread(target, 'auto');

		if (intent === 'start') {
			pendingNavIntentRef.current = false;
			clearReaderNavIntent();
			return;
		}

		if (spreadIndexRef.current >= metrics.spreadCount - 1) {
			pendingNavIntentRef.current = false;
			navIntentRef.current = 'start';
			clearReaderNavIntent();
		}
	}, [goToSpread, isCover]);

	const syncMetrics = useCallback(() => {
		const flow = flowRef.current;
		const scroller = scrollerRef.current;
		if (!flow || !scroller) return;

		const metrics = getSpreadMetrics(flow, scroller, isCover);
		setSpreadCount(metrics.spreadCount);
		spreadCountRef.current = metrics.spreadCount;
		setColumnsPerSpread(metrics.columnsPerSpread);
		setTotalColumns(metrics.totalColumns);

		if (pendingNavIntentRef.current || navIntentRef.current === 'last') {
			applyPendingNavIntent();
		} else {
			const maxSpread = Math.max(0, metrics.spreadCount - 1);
			const clamped = Math.min(spreadIndexRef.current, maxSpread);
			const offset =
				clamped === 0
					? 0
					: clamped * (scroller.clientWidth || metrics.spreadWidth);

			scroller.scrollLeft = offset;
			spreadIndexRef.current = clamped;
			setSpreadIndex(clamped);
		}

		setReady(true);
		readyRef.current = true;
	}, [applyPendingNavIntent, isCover]);

	const navigate = useCallback(
		(direction: 'prev' | 'next') => {
			if (isCover) {
				if (direction === 'next' && nextHrefRef.current) {
					setReaderNavIntent('start');
					router.push(nextHrefRef.current);
				}
				return;
			}

			if (!readyRef.current) return;

			const atStart = spreadIndexRef.current <= 0;
			const atEnd = spreadIndexRef.current >= spreadCountRef.current - 1;

			if (direction === 'prev') {
				if (atStart && prevHrefRef.current) {
					setReaderNavIntent('last');
					router.push(prevHrefRef.current);
					return;
				}
				if (!atStart) goToSpread(spreadIndexRef.current - 1);
				return;
			}

			if (atEnd && nextHrefRef.current) {
				setReaderNavIntent('start');
				router.push(nextHrefRef.current);
				return;
			}
			if (!atEnd) goToSpread(spreadIndexRef.current + 1);
		},
		[goToSpread, isCover, router],
	);

	useLayoutEffect(() => {
		navIntentRef.current = peekReaderNavIntent();
		pendingNavIntentRef.current = true;
		spreadIndexRef.current = 0;
		setSpreadIndex(0);
		setReady(false);
		readyRef.current = false;
	}, [chapterKey]);

	useLayoutEffect(() => {
		syncMetrics();
	}, [syncMetrics, children]);

	useEffect(() => {
		const flow = flowRef.current;
		const scroller = scrollerRef.current;
		if (!flow || !scroller) return;

		const observer = new ResizeObserver(() => syncMetrics());
		observer.observe(flow);
		observer.observe(scroller);

		const onViewportChange = () => syncMetrics();
		const spreadQuery = window.matchMedia(SPREAD_MEDIA_QUERY);
		window.addEventListener('resize', onViewportChange);
		window.addEventListener('orientationchange', onViewportChange);
		spreadQuery.addEventListener('change', onViewportChange);

		const mutation = new MutationObserver(() => syncMetrics());
		mutation.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-reader-font-size', 'data-reader-theme'],
		});

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', onViewportChange);
			window.removeEventListener('orientationchange', onViewportChange);
			spreadQuery.removeEventListener('change', onViewportChange);
			mutation.disconnect();
		};
	}, [syncMetrics]);

	useEffect(() => {
		prevHrefRef.current = prevHref;
		nextHrefRef.current = nextHref;
	}, [prevHref, nextHref]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (isEditableTarget(event.target)) return;

			const isPrev = event.key === 'ArrowLeft' || event.key === 'PageUp';
			const isNext = event.key === 'ArrowRight' || event.key === 'PageDown';
			if (!isPrev && !isNext) return;

			event.preventDefault();
			navigate(isPrev ? 'prev' : 'next');
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [navigate]);

	useEffect(() => {
		const root = paginatorRef.current;
		if (!root) return;

		const onTouchStart = (event: TouchEvent) => {
			if (event.touches.length !== 1) return;
			touchStartRef.current = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY,
			};
		};

		const onTouchEnd = (event: TouchEvent) => {
			const start = touchStartRef.current;
			touchStartRef.current = null;
			if (!start || event.changedTouches.length !== 1) return;

			const deltaX = event.changedTouches[0].clientX - start.x;
			const deltaY = event.changedTouches[0].clientY - start.y;
			if (Math.abs(deltaY) > SWIPE_RESTRAINT_PX) return;
			if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

			navigate(deltaX < 0 ? 'next' : 'prev');
		};

		root.addEventListener('touchstart', onTouchStart, { passive: true });
		root.addEventListener('touchend', onTouchEnd, { passive: true });

		return () => {
			root.removeEventListener('touchstart', onTouchStart);
			root.removeEventListener('touchend', onTouchEnd);
		};
	}, [navigate]);

	const atStart = spreadIndex <= 0;
	const atEnd = spreadIndex >= spreadCount - 1;
	const canGoPrev = ready && (!atStart || Boolean(prevHref));
	const canGoNext = ready && (!atEnd || Boolean(nextHref));
	const startColumn = spreadIndex * columnsPerSpread;

	const chapterPage = isCover ? 1 : startColumn + 1;
	const chapterTotalPages = isCover ? 1 : totalColumns;
	const lastVisibleColumn = Math.min(startColumn + columnsPerSpread, totalColumns) - 1;
	const pagesLeftInChapter = isCover
		? 0
		: Math.max(0, totalColumns - 1 - lastVisibleColumn);
	const chapterStatus = formatChapterStatus(pagesLeftInChapter);
	const isSpread = columnsPerSpread === 2;
	const showScrubber = isSpread && !isCover && spreadCount > 1;

	return (
		<div
			ref={paginatorRef}
			className="reader-paginator"
			data-ready={ready ? 'true' : undefined}
			data-cover={isCover ? 'true' : undefined}
		>
			<button
				type="button"
				className="reader-paginator__arrow reader-paginator__arrow--prev"
				aria-label={atStart && prevHref ? 'Previous chapter' : 'Previous page'}
				disabled={!canGoPrev}
				hidden={!canGoPrev}
				onClick={() => navigate('prev')}
			>
				<ChevronIcon direction="left" />
			</button>

			<div className="reader-paginator__book">
				<div className="reader-paginator__stage">
					<div className="reader-paginator__scroller" ref={scrollerRef}>
						<div className="reader-paginator__flow" ref={flowRef}>
							{children}
						</div>
					</div>
				</div>
			</div>

			<button
				type="button"
				className="reader-paginator__arrow reader-paginator__arrow--next"
				aria-label={atEnd && nextHref ? 'Next chapter' : 'Next page'}
				disabled={!canGoNext}
				hidden={!canGoNext}
				onClick={() => navigate('next')}
			>
				<ChevronIcon direction="right" />
			</button>

			<div className="reader-paginator__footer" aria-live="polite">
				{showScrubber ? (
					<div
						className="reader-paginator__scrubber"
						role="progressbar"
						aria-valuemin={1}
						aria-valuemax={spreadCount}
						aria-valuenow={spreadIndex + 1}
						aria-label="Position in chapter"
					>
						<div
							className="reader-paginator__scrubber-fill"
							style={{ width: `${((spreadIndex + 1) / spreadCount) * 100}%` }}
						/>
					</div>
				) : (
					<span className="reader-paginator__scrubber-spacer" aria-hidden="true" />
				)}
				<span className="reader-paginator__progress">
					{chapterPage} of {chapterTotalPages}
				</span>
				<span className="reader-paginator__status">
					{chapterLabel ? `${chapterLabel} · ${chapterStatus}` : chapterStatus}
				</span>
				<span className="reader-paginator__page-number">{chapterPage}</span>
			</div>
		</div>
	);
}
