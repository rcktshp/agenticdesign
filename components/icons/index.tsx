'use client';

import {
	ArrowSquareOut,
	BookmarkSimple,
	CaretLeft,
	CaretRight,
	Check,
	CircleHalf,
	Columns,
	DotsThree,
	Highlighter,
	House,
	List,
	MagnifyingGlass,
	Monitor,
	Moon,
	Note,
	Scroll,
	Sun,
	TextAa,
	TextT,
	X,
} from '@phosphor-icons/react';
import { iconPixels, type IconSize } from '@/components/icons/Icon';

export type { IconSize };

type NamedIconProps = {
	size?: IconSize;
	className?: string;
};

export function HomeIcon({ size = 'md', className }: NamedIconProps) {
	return <House size={iconPixels(size)} className={className} aria-hidden />;
}

export function ListIcon({ size = 'md', className }: NamedIconProps) {
	return <List size={iconPixels(size)} className={className} aria-hidden />;
}

export function BookmarkMenuIcon({ size = 'md', className }: NamedIconProps) {
	return <BookmarkSimple size={iconPixels(size)} className={className} aria-hidden />;
}

export function BookmarkIcon({
	filled = false,
	size = 16,
	className,
	label,
}: {
	filled?: boolean;
	size?: IconSize;
	className?: string;
	label?: string;
}) {
	return (
		<BookmarkSimple
			size={iconPixels(size)}
			weight={filled ? 'fill' : 'regular'}
			color={filled ? '#ff3b30' : undefined}
			className={className}
			aria-hidden={label ? undefined : true}
			aria-label={label}
		/>
	);
}

export function HighlightsIcon({ size = 'md', className }: NamedIconProps) {
	return <Highlighter size={iconPixels(size)} className={className} aria-hidden />;
}

export function SearchIcon({ size = 'md', className }: NamedIconProps) {
	return <MagnifyingGlass size={iconPixels(size)} className={className} aria-hidden />;
}

export function TextSizeIcon({
	variant = 'toolbar',
	className,
	size,
}: {
	variant?: 'toolbar' | 'decrease' | 'increase';
	className?: string;
	size?: IconSize;
}) {
	const pixelSize =
		variant === 'decrease' ? iconPixels(size ?? 'sm') : variant === 'increase' ? iconPixels(size ?? 'lg') + 2 : iconPixels(size ?? 'md');

	if (variant === 'decrease') {
		return <TextT size={pixelSize} className={className} aria-hidden />;
	}

	if (variant === 'increase') {
		return <TextAa size={pixelSize} weight="bold" className={className} aria-hidden />;
	}

	return <TextAa size={pixelSize} className={className} aria-hidden />;
}

export function ThemeSampleIcon({ className }: { className?: string }) {
	return <TextAa size={28} weight="bold" className={className} aria-hidden />;
}

export function AppearanceIcon({ size = 'md', className }: NamedIconProps) {
	return <CircleHalf size={iconPixels(size)} className={className} aria-hidden />;
}

export function LightModeIcon({ size = 'sm', className }: NamedIconProps) {
	return <Sun size={iconPixels(size)} className={className} aria-hidden />;
}

export function DarkModeIcon({ size = 'sm', className }: NamedIconProps) {
	return <Moon size={iconPixels(size)} className={className} aria-hidden />;
}

export function SystemModeIcon({ size = 'sm', className }: NamedIconProps) {
	return <Monitor size={iconPixels(size)} className={className} aria-hidden />;
}

export function CheckIcon({ className }: { className?: string }) {
	return <Check size={14} weight="bold" className={className} aria-hidden />;
}

export function ChevronIcon({
	direction,
	className,
	size = 'lg',
}: {
	direction: 'left' | 'right';
	className?: string;
	size?: IconSize;
}) {
	const Icon = direction === 'left' ? CaretLeft : CaretRight;
	return <Icon size={iconPixels(size)} weight="bold" className={className} aria-hidden />;
}

export function NoteIcon({ size = 'sm', className }: NamedIconProps) {
	return <Note size={iconPixels(size)} className={className} aria-hidden />;
}

export function PagesIcon({ size = 'md', className }: NamedIconProps) {
	return <Columns size={iconPixels(size)} className={className} aria-hidden />;
}

export function ScrollIcon({ size = 'md', className }: NamedIconProps) {
	return <Scroll size={iconPixels(size)} className={className} aria-hidden />;
}

export function CloseIcon({ size = 'sm', className }: NamedIconProps) {
	return <X size={iconPixels(size)} className={className} aria-hidden />;
}

export function SectionDividerIcon({ className }: { className?: string }) {
	return <DotsThree size={48} weight="bold" className={className} aria-hidden />;
}

export function ExternalLinkIcon({ size = 'sm', className }: NamedIconProps) {
	return <ArrowSquareOut size={iconPixels(size)} className={className} aria-hidden />;
}
