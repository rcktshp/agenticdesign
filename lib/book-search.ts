export type BookSearchChapter = {
	slug: string;
	label: string;
	href: string;
	startPage: number;
	plainText: string;
};

export type BookSearchResult = {
	slug: string;
	label: string;
	href: string;
	startPage: number;
	snippet: string;
	matchText: string;
};

const MAX_RESULTS = 50;
const MAX_MATCHES_PER_CHAPTER = 5;
const SNIPPET_RADIUS = 72;

function makeSnippet(text: string, index: number, matchLength: number): string {
	const start = Math.max(0, index - SNIPPET_RADIUS);
	const end = Math.min(text.length, index + matchLength + SNIPPET_RADIUS);
	let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
	if (start > 0) snippet = `…${snippet}`;
	if (end < text.length) snippet = `${snippet}…`;
	return snippet;
}

function findMatchIndices(text: string, query: string): number[] {
	const indices: number[] = [];
	const lowerText = text.toLowerCase();
	const lowerQuery = query.toLowerCase();
	let position = 0;

	while (position < lowerText.length && indices.length < MAX_MATCHES_PER_CHAPTER) {
		const index = lowerText.indexOf(lowerQuery, position);
		if (index === -1) break;
		indices.push(index);
		position = index + Math.max(lowerQuery.length, 1);
	}

	return indices;
}

export function searchBook(
	index: BookSearchChapter[],
	query: string,
	maxResults = MAX_RESULTS,
): BookSearchResult[] {
	const normalizedQuery = query.trim().replace(/\s+/g, ' ');
	if (normalizedQuery.length < 2) return [];

	const results: BookSearchResult[] = [];

	for (const chapter of index) {
		const indices = findMatchIndices(chapter.plainText, normalizedQuery);
		for (const matchIndex of indices) {
			const matchText = chapter.plainText.slice(matchIndex, matchIndex + normalizedQuery.length);
			results.push({
				slug: chapter.slug,
				label: chapter.label,
				href: chapter.href,
				startPage: chapter.startPage,
				snippet: makeSnippet(chapter.plainText, matchIndex, normalizedQuery.length),
				matchText,
			});

			if (results.length >= maxResults) {
				return results;
			}
		}
	}

	return results;
}
