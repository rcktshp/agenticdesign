'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { ChevronIcon } from '@/components/icons';
import {
	clearReaderNavIntent,
	peekReaderNavIntent,
	setReaderNavIntent,
} from '@/lib/reader-navigation';

type Props = {
	chapterKey: string;
	prevHref?: string;
	nextHref?: string;
	children: ReactNode;
};

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function isAtScrollTop(): boolean {
	return window.scrollY <= 8;
}

function isAtScrollBottom(): boolean {
	return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
}

export default function ReaderScroll({ chapterKey, prevHref, nextHref, children }: Props) {
	const router = useRouter();
	const readyRef = useRef(false);

	const goToChapter = useCallback(
		(href: string, intent: 'start' | 'last') => {
			setReaderNavIntent(intent);
			router.push(href);
		},
		[router],
	);

	useLayoutEffect(() => {
		readyRef.current = false;
		const intent = peekReaderNavIntent();
		let cleared = false;

		const applyScrollIntent = () => {
			if (intent === 'last') {
				window.scrollTo({
					top: document.documentElement.scrollHeight,
					behavior: 'auto',
				});

				if (isAtScrollBottom()) {
					if (!cleared) {
						clearReaderNavIntent();
						cleared = true;
					}
					readyRef.current = true;
				}
				return;
			}

			window.scrollTo({ top: 0, behavior: 'auto' });
			if (!cleared) {
				clearReaderNavIntent();
				cleared = true;
			}
			readyRef.current = true;
		};

		applyScrollIntent();
		requestAnimationFrame(applyScrollIntent);

		const observer = new ResizeObserver(() => applyScrollIntent());
		observer.observe(document.documentElement);
		if (document.body) {
			observer.observe(document.body);
		}

		return () => observer.disconnect();
	}, [chapterKey]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!readyRef.current || isEditableTarget(event.target)) return;

			const isPrev = event.key === 'ArrowLeft' || event.key === 'PageUp';
			const isNext = event.key === 'ArrowRight' || event.key === 'PageDown';
			if (!isPrev && !isNext) return;

			if (isPrev && isAtScrollTop() && prevHref) {
				event.preventDefault();
				setReaderNavIntent('last');
				router.push(prevHref);
				return;
			}

			if (isNext && isAtScrollBottom() && nextHref) {
				event.preventDefault();
				setReaderNavIntent('start');
				router.push(nextHref);
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [nextHref, prevHref, router]);

	const showNav = Boolean(prevHref || nextHref);

	return (
		<div className="reader-scroll">
			{children}
			{showNav ? (
				<nav className="reader-scroll-nav" aria-label="Chapter">
					{prevHref ? (
						<button
							type="button"
							className="reader-scroll-nav__link reader-scroll-nav__link--prev"
							aria-label="Previous chapter"
							onClick={() => goToChapter(prevHref, 'last')}
						>
							<ChevronIcon direction="left" size="sm" />
							<span>Previous</span>
						</button>
					) : (
						<span className="reader-scroll-nav__spacer" aria-hidden="true" />
					)}
					{nextHref ? (
						<button
							type="button"
							className="reader-scroll-nav__link reader-scroll-nav__link--next"
							aria-label="Next chapter"
							onClick={() => goToChapter(nextHref, 'start')}
						>
							<span>Next</span>
							<ChevronIcon direction="right" size="sm" />
						</button>
					) : (
						<span className="reader-scroll-nav__spacer" aria-hidden="true" />
					)}
				</nav>
			) : null}
		</div>
	);
}
