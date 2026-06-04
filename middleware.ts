import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
	canActivatePreviewBypass,
	getPreviewBypassKeyFromPath,
	PREVIEW_COOKIE,
	PREVIEW_EXIT_PATH,
} from '@/lib/coming-soon-gate';
import { site } from '@/lib/site';

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
		return withPreviewCookie(NextResponse.redirect(new URL('/', request.url)), false);
	}

	const pathKey = getPreviewBypassKeyFromPath(pathname);
	if (pathKey && canActivatePreviewBypass(pathKey)) {
		return withPreviewCookie(NextResponse.redirect(new URL('/', request.url)), true);
	}

	if (pathname.startsWith('/preview/')) {
		return NextResponse.redirect(new URL('/coming-soon', request.url));
	}

	if (hasPreviewCookie(request)) {
		return NextResponse.next();
	}

	return null;
}

export function middleware(request: NextRequest) {
	if (!site.comingSoonGateEnabled) {
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

	return NextResponse.redirect(new URL('/coming-soon', request.url));
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|favicon.svg|images/|api/).*)',
	],
};
