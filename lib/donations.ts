import type Stripe from 'stripe';
import { minDonationCents } from './site';

export type DownloadFormat = 'pdf' | 'epub';

export function isDevBypassEnabled(): boolean {
	return process.env.NODE_ENV === 'development' && process.env.DEV_SKIP_DONATION === 'true';
}

export function isDonationSufficient(amountTotal: number | null | undefined): boolean {
	if (amountTotal == null) return false;
	return amountTotal >= minDonationCents;
}

export async function verifyCheckoutSession(
	stripe: Stripe,
	sessionId: string,
): Promise<{ ok: true; session: Stripe.Checkout.Session } | { ok: false; reason: string }> {
	if (!sessionId.startsWith('cs_')) {
		return { ok: false, reason: 'Invalid session.' };
	}

	try {
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		if (session.payment_status !== 'paid') {
			return { ok: false, reason: 'Payment not completed.' };
		}
		if (!isDonationSufficient(session.amount_total)) {
			return { ok: false, reason: 'Donation below minimum.' };
		}
		return { ok: true, session };
	} catch {
		return { ok: false, reason: 'Could not verify payment.' };
	}
}
