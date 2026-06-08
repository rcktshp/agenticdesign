export type IconSize = 'sm' | 'md' | 'lg' | number;

const ICON_SIZES: Record<'sm' | 'md' | 'lg', number> = {
	sm: 16,
	md: 18,
	lg: 20,
};

export function iconPixels(size: IconSize = 'md'): number {
	return typeof size === 'number' ? size : ICON_SIZES[size];
}
