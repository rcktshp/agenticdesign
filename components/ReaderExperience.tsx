'use client';

import { useEffect, useState, type ReactNode } from 'react';
import ReaderPaginator from '@/components/ReaderPaginator';
import ReaderScroll from '@/components/ReaderScroll';
import {
	defaultReaderPreferences,
	loadReaderPreferences,
	type ReaderLayoutMode,
} from '@/lib/reader-preferences';

type ReaderProps = {
	chapterKey: string;
	chapterLabel?: string;
	startPage: number;
	isCover?: boolean;
	nextHref?: string;
	prevHref?: string;
};

type Props = ReaderProps & {
	children: ReactNode;
};

function readLayoutMode(): ReaderLayoutMode {
	if (typeof window === 'undefined') return defaultReaderPreferences.layoutMode;
	return loadReaderPreferences().layoutMode;
}

export default function ReaderExperience({ children, ...readerProps }: Props) {
	const [layoutMode, setLayoutMode] = useState<ReaderLayoutMode>(() => readLayoutMode());

	useEffect(() => {
		const sync = () => {
			const mode = document.documentElement.dataset.readerLayout;
			setLayoutMode(mode === 'scroll' ? 'scroll' : 'pages');
		};

		sync();

		const observer = new MutationObserver(sync);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-reader-layout'],
		});

		return () => observer.disconnect();
	}, []);

	if (layoutMode === 'scroll') {
		return (
			<ReaderScroll
				chapterKey={readerProps.chapterKey}
				prevHref={readerProps.prevHref}
				nextHref={readerProps.nextHref}
			>
				{children}
			</ReaderScroll>
		);
	}

	return <ReaderPaginator {...readerProps}>{children}</ReaderPaginator>;
}
