import { site } from '@/lib/site';

export const PREVIEW_COOKIE = 'ads_site_preview';
export const PREVIEW_BYPASS_PATH = '/preview';
export const PREVIEW_EXIT_PATH = '/preview/exit';

export function canActivatePreviewBypass(key: string | null): boolean {
	if (!key) {
		return false;
	}

	return key === site.previewBypassKey;
}

export function getPreviewBypassKeyFromPath(pathname: string): string | null {
	if (!pathname.startsWith(`${PREVIEW_BYPASS_PATH}/`)) {
		return null;
	}

	const key = pathname.slice(PREVIEW_BYPASS_PATH.length + 1);
	if (!key || key === 'exit') {
		return null;
	}

	return decodeURIComponent(key);
}
