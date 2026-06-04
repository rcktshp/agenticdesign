import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
	type DownloadFormat,
	isDevBypassEnabled,
	verifyCheckoutSession,
} from '@/lib/donations';
import { getStripe } from '@/lib/stripe';

const FORMATS: Record<DownloadFormat, { filename: string; contentType: string }> = {
	pdf: { filename: 'agentic-design.pdf', contentType: 'application/pdf' },
	epub: { filename: 'agentic-design.epub', contentType: 'application/epub+zip' },
};

async function isAuthorized(sessionId: string | null): Promise<boolean> {
	if (!sessionId) return false;
	if (isDevBypassEnabled() && sessionId === 'dev_bypass') return true;
	const stripe = getStripe();
	if (!stripe) return false;
	const result = await verifyCheckoutSession(stripe, sessionId);
	return result.ok;
}

type Props = { params: Promise<{ format: string }> };

export async function GET(request: Request, { params }: Props) {
	const { format } = await params;
	const meta = FORMATS[format as DownloadFormat];
	if (!meta) {
		return new NextResponse('Unknown format. Use pdf or epub.', { status: 404 });
	}

	const sessionId = new URL(request.url).searchParams.get('session_id');
	if (!(await isAuthorized(sessionId))) {
		return new NextResponse('Unauthorized. Complete a donation first.', { status: 401 });
	}

	const filePath = path.join(process.cwd(), 'private', 'downloads', meta.filename);
	try {
		const data = await fs.readFile(filePath);
		return new NextResponse(data, {
			status: 200,
			headers: {
				'Content-Type': meta.contentType,
				'Content-Disposition': `attachment; filename="${meta.filename}"`,
				'Cache-Control': 'private, no-store',
			},
		});
	} catch {
		return new NextResponse(
			`File not found. Add your ${format.toUpperCase()} to private/downloads/${meta.filename}`,
			{ status: 404 },
		);
	}
}
