import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPreviewBypassAllowed, PREVIEW_COOKIE } from '@/lib/coming-soon-gate';
import { site } from '@/lib/site';

function withPreviewCookie(response: NextResponse, enabled: boolean): NextResponse {
	if (enabled) {
		response.cookies.set(PREVIEW_COOKIE, '1', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7,
		});
	} else {
		response.cookies.delete(PREVIEW_COOKIE);
	}
	return response;
}

function hasPreviewCookie(request: NextRequest): boolean {
	return request.cookies.get(PREVIEW_COOKIE)?.value === '1';
}

export function middleware(request: NextRequest) {
	if (!site.comingSoonGateEnabled) {
		return NextResponse.next();
	}

	const { pathname, searchParams } = request.nextUrl;

	if (pathname === '/coming-soon') {
		return NextResponse.next();
	}

	if (isPreviewBypassAllowed()) {
		const preview = searchParams.get('preview');

		if (preview === '1') {
			const url = request.nextUrl.clone();
			url.searchParams.delete('preview');
			return withPreviewCookie(NextResponse.redirect(url), true);
		}

		if (preview === '0') {
			const url = request.nextUrl.clone();
			url.searchParams.delete('preview');
			return withPreviewCookie(NextResponse.redirect(url), false);
		}

		if (hasPreviewCookie(request)) {
			return NextResponse.next();
		}
	}

	return NextResponse.redirect(new URL('/coming-soon', request.url));
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|favicon.svg|images/|api/).*)',
	],
};
