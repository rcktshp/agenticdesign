import ReaderChrome from '@/components/ReaderChrome';
import { getBookSearchIndex } from '@/lib/book-search-index';
import { getReaderChapters } from '@/lib/reader-contents';

export default function ReaderShell({ children }: { children: React.ReactNode }) {
	return (
		<ReaderChrome chapters={getReaderChapters()} searchIndex={getBookSearchIndex()}>
			{children}
		</ReaderChrome>
	);
}
