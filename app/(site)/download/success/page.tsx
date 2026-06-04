import type { Metadata } from 'next';
import Link from 'next/link';
import { isDevBypassEnabled, verifyCheckoutSession } from '@/lib/donations';
import { getStripe } from '@/lib/stripe';
import { site } from '@/lib/site';

export const metadata: Metadata = {
	title: 'Downloads ready',
	description: 'Your PDF and EPUB downloads.',
};

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function DownloadSuccessPage({ searchParams }: Props) {
	const { session_id: sessionId = '' } = await searchParams;
	let verified = false;
	let error = '';

	if (isDevBypassEnabled() && sessionId === 'dev_bypass') {
		verified = true;
	} else if (!sessionId) {
		error = 'Missing payment session. Complete checkout from the download page.';
	} else {
		const stripe = getStripe();
		if (!stripe) {
			error = 'Payments are not configured on this server.';
		} else {
			const result = await verifyCheckoutSession(stripe, sessionId);
			if (result.ok) {
				verified = true;
			} else {
				error = result.reason;
			}
		}
	}

	const downloadBase = '/api/download';

	return (
		<main className="page page--narrow">
			<h1>Thank you</h1>
			{verified ? (
				<div className="download-success">
					<p>
						Your donation unlocked offline formats for <cite>{site.title}</cite>.
					</p>
					<ul>
						<li>
							<a
								className="btn"
								href={`${downloadBase}/pdf?session_id=${encodeURIComponent(sessionId)}`}
							>
								Download PDF
							</a>
						</li>
						<li>
							<a
								className="btn btn--ghost"
								href={`${downloadBase}/epub?session_id=${encodeURIComponent(sessionId)}`}
							>
								Download EPUB
							</a>
						</li>
					</ul>
					<p className="message-muted">Keep this page bookmarked; links require your payment session.</p>
				</div>
			) : (
				<p className="message-error">{error}</p>
			)}
			<p>
				<Link href="/table-of-contents">Continue reading online</Link>
			</p>
		</main>
	);
}
