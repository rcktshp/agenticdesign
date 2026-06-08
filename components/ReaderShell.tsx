import ReaderChrome from '@/components/ReaderChrome';
import { getReaderChapters } from '@/lib/reader-contents';

export default function ReaderShell({ children }: { children: React.ReactNode }) {
	return <ReaderChrome chapters={getReaderChapters()}>{children}</ReaderChrome>;
}
