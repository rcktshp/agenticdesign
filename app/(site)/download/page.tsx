import type { Metadata } from 'next';
import Link from 'next/link';
import DonationForm from '@/components/DonationForm';
import { isDevBypassEnabled } from '@/lib/donations';
import { minDonationCents, site } from '@/lib/site';

export const metadata: Metadata = {
	title: 'Download',
	description: `Download ${site.title} as PDF or EPUB after a minimum donation.`,
};

export default function DownloadPage() {
	const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
	const devBypass = isDevBypassEnabled();

	return (
		<main className="page page--narrow">
			<h1>Download the e-book</h1>
			<p>
				The full book is <Link href="/table-of-contents">free to read online</Link>. PDF and EPUB are
				available after a minimum donation of <strong>${site.minDonationUsd}</strong> to support the
				project.
			</p>

			{devBypass && (
				<p className="message-muted">
					Dev mode: set <code>DEV_SKIP_DONATION=true</code> — use{' '}
					<Link href="/download/success?session_id=dev_bypass">
						/download/success?session_id=dev_bypass
					</Link>{' '}
					to test downloads.
				</p>
			)}

			{!stripeConfigured && !devBypass ? (
				<p className="message-error">
					Stripe is not configured yet. Add <code>STRIPE_SECRET_KEY</code> to your environment (see
					README).
				</p>
			) : (
				<DonationForm />
			)}

			<p className="message-muted">
				Minimum charge: ${site.minDonationUsd} ({minDonationCents} cents). You can give more—thank you.
			</p>
		</main>
	);
}
