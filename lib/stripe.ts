import Stripe from 'stripe';

export function getStripe(): Stripe | null {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) return null;
	return new Stripe(key);
}

export function getSiteUrl(request: Request): string {
	const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL;
	if (configured) return configured.replace(/\/$/, '');
	return new URL(request.url).origin;
}
