export const PREVIEW_COOKIE = 'ads_site_preview';

export function isPreviewBypassAllowed(): boolean {
	return process.env.NODE_ENV === 'development';
}
