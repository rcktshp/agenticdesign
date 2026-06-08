import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
	canActivatePreviewBypass,
	getPreviewBypassKeyFromPath,
	PREVIEW_COOKIE,
	PREVIEW_EXIT_PATH,
} from '@/lib/coming-soon-gate';
import { site } from '@/lib/site';

function buildRedirectUrl(request: NextRequest, pathname: string): URL {
	const url = request.nextUrl.clone();
	url.pathname = pathname;
	url.search = '';

	const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
	if (host) {
		url.host = host;
	}

	return url;
}

function withPreviewCookie(response: NextResponse, enabled: boolean): NextResponse {
	if (enabled) {
		response.cookies.set(PREVIEW_COOKIE, '1', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7,
			secure: process.env.NODE_ENV === 'production',
		});
	} else {
		response.cookies.delete(PREVIEW_COOKIE);
	}
	return response;
}

function hasPreviewCookie(request: NextRequest): boolean {
	return request.cookies.get(PREVIEW_COOKIE)?.value === '1';
}

function handlePreviewBypass(request: NextRequest): NextResponse | null {
	const { pathname } = request.nextUrl;

	if (pathname === PREVIEW_EXIT_PATH) {
		return withPreviewCookie(
			NextResponse.redirect(buildRedirectUrl(request, '/')),
			false,
		);
	}

	const pathKey = getPreviewBypassKeyFromPath(pathname);
	if (pathKey && canActivatePreviewBypass(pathKey)) {
		return withPreviewCookie(
			NextResponse.redirect(buildRedirectUrl(request, '/')),
			true,
		);
	}

	if (pathname.startsWith('/preview/')) {
		return NextResponse.redirect(buildRedirectUrl(request, '/coming-soon'));
	}

	if (hasPreviewCookie(request)) {
		return NextResponse.next();
	}

	return null;
}

export function middleware(request: NextRequest) {
	if (!site.comingSoonGateEnabled || process.env.NODE_ENV === 'development') {
		return NextResponse.next();
	}

	const { pathname } = request.nextUrl;

	if (pathname === '/coming-soon') {
		return NextResponse.next();
	}

	const previewResponse = handlePreviewBypass(request);
	if (previewResponse) {
		return previewResponse;
	}

	return NextResponse.redirect(buildRedirectUrl(request, '/coming-soon'));
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|favicon.svg|images/|api/).*)',
	],
};
