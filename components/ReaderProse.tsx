'use client';

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
} from 'react';
import {
	addHighlight,
	HIGHLIGHT_COLORS,
	loadHighlights,
	type HighlightColor,
} from '@/lib/reader-annotations';
import { NoteIcon } from '@/components/icons';

type Props = {
	slug: string;
	children: ReactNode;
};

type SelectionMenu = {
	x: number;
	y: number;
	text: string;
};

function wrapTextInContainer(
	container: HTMLElement,
	searchText: string,
	color: HighlightColor,
	id: string,
): boolean {
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
	let node: Text | null = walker.nextNode() as Text | null;

	while (node) {
		const content = node.textContent ?? '';
		const index = content.indexOf(searchText);
		if (index >= 0) {
			const mark = document.createElement('mark');
			mark.className = `reader-highlight reader-highlight--${color}`;
			mark.dataset.highlightId = id;

			const range = document.createRange();
			range.setStart(node, index);
			range.setEnd(node, index + searchText.length);
			range.surroundContents(mark);
			return true;
		}
		node = walker.nextNode() as Text | null;
	}

	return false;
}

function applyHighlights(container: HTMLElement, slug: string): void {
	container.querySelectorAll('mark.reader-highlight').forEach((mark) => {
		const parent = mark.parentNode;
		if (!parent) return;
		parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark);
		parent.normalize();
	});

	for (const highlight of loadHighlights().filter((item) => item.slug === slug)) {
		wrapTextInContainer(container, highlight.text, highlight.color, highlight.id);
	}
}

export default function ReaderProse({ slug, children }: Props) {
	const rootRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [menu, setMenu] = useState<SelectionMenu | null>(null);
	const [noteDraft, setNoteDraft] = useState('');
	const [noteColor, setNoteColor] = useState<HighlightColor>('yellow');
	const [showNoteForm, setShowNoteForm] = useState(false);

	const closeMenu = useCallback(() => {
		setMenu(null);
		setShowNoteForm(false);
		setNoteDraft('');
	}, []);

	const refreshHighlights = useCallback(() => {
		if (!rootRef.current) return;
		applyHighlights(rootRef.current, slug);
	}, [slug]);

	useEffect(() => {
		refreshHighlights();
	}, [refreshHighlights]);

	useEffect(() => {
		const onChange = () => refreshHighlights();
		window.addEventListener('reader-annotations-change', onChange);
		return () => window.removeEventListener('reader-annotations-change', onChange);
	}, [refreshHighlights]);

	useEffect(() => {
		if (!menu) return;

		const onPointerDown = (event: MouseEvent) => {
			if (menuRef.current?.contains(event.target as Node)) return;
			closeMenu();
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeMenu();
		};

		document.addEventListener('mousedown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('mousedown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [menu, closeMenu]);

	const onMouseUp = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
		if (menuRef.current?.contains(event.target as Node)) return;

		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || !rootRef.current) {
			setMenu(null);
			return;
		}

		const range = selection.getRangeAt(0);
		if (!rootRef.current.contains(range.commonAncestorContainer)) {
			setMenu(null);
			return;
		}

		const text = selection.toString().trim();
		if (text.length < 2) {
			setMenu(null);
			return;
		}

		const rect = range.getBoundingClientRect();
		setShowNoteForm(false);
		setNoteDraft('');
		setMenu({
			x: rect.left + rect.width / 2,
			y: Math.max(rect.top - 12, 72),
			text,
		});
	}, []);

	const onHighlight = useCallback(
		(color: HighlightColor) => {
			if (!menu) return;
			addHighlight({ slug, text: menu.text, color });
			window.getSelection()?.removeAllRanges();
			closeMenu();
			refreshHighlights();
		},
		[closeMenu, menu, refreshHighlights, slug],
	);

	const onSaveNote = useCallback(() => {
		if (!menu) return;
		addHighlight({ slug, text: menu.text, color: noteColor, note: noteDraft });
		window.getSelection()?.removeAllRanges();
		closeMenu();
		refreshHighlights();
	}, [closeMenu, menu, noteColor, noteDraft, refreshHighlights, slug]);

	return (
		<>
			<div ref={rootRef} className="reader-prose-root" onMouseUp={onMouseUp}>
				{children}
			</div>

			{menu && (
				<div
					ref={menuRef}
					className="reader-selection-menu"
					style={{ left: menu.x, top: menu.y }}
					role="dialog"
					aria-label="Text actions"
				>
					{!showNoteForm ? (
						<>
							<div className="reader-selection-menu__colors" role="group" aria-label="Highlight color">
								{HIGHLIGHT_COLORS.map((color) => (
									<button
										key={color.id}
										type="button"
										className={`reader-selection-menu__color reader-selection-menu__color--${color.id}`}
										aria-label={`Highlight ${color.label.toLowerCase()}`}
										onClick={() => onHighlight(color.id)}
									/>
								))}
							</div>
							<button
								type="button"
								className="reader-selection-menu__action"
								onClick={() => {
									setNoteColor('yellow');
									setShowNoteForm(true);
								}}
							>
								<NoteIcon />
								Add Note
							</button>
						</>
					) : (
						<div className="reader-selection-menu__note">
							<p className="reader-selection-menu__quote">&ldquo;{menu.text}&rdquo;</p>
							<textarea
								value={noteDraft}
								onChange={(event) => setNoteDraft(event.target.value)}
								placeholder="Write a note…"
								rows={3}
								autoFocus
							/>
							<div className="reader-selection-menu__note-colors" role="group" aria-label="Note color">
								{HIGHLIGHT_COLORS.map((color) => (
									<button
										key={color.id}
										type="button"
										className={`reader-selection-menu__color reader-selection-menu__color--${color.id}`}
										data-active={noteColor === color.id ? 'true' : undefined}
										aria-label={`Note color ${color.label.toLowerCase()}`}
										aria-pressed={noteColor === color.id}
										onClick={() => setNoteColor(color.id)}
									/>
								))}
							</div>
							<div className="reader-selection-menu__note-actions">
								<button type="button" onClick={closeMenu}>
									Cancel
								</button>
								<button type="button" className="reader-selection-menu__save" onClick={onSaveNote}>
									Save
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
}
