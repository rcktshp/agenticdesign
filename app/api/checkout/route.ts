import { NextResponse } from 'next/server';
import { minDonationCents, site } from '@/lib/site';
import { getSiteUrl, getStripe } from '@/lib/stripe';

function parseAmountCents(formData: FormData): number | null {
	const selected = formData.get('amountUsd');
	if (selected === 'custom') {
		const custom = Number(formData.get('customUsd'));
		if (!Number.isFinite(custom)) return null;
		return Math.round(custom * 100);
	}
	const preset = Number(selected);
	if (!Number.isFinite(preset)) return null;
	return Math.round(preset * 100);
}

export async function POST(request: Request) {
	const stripe = getStripe();
	if (!stripe) {
		return new NextResponse('Stripe is not configured.', { status: 503 });
	}

	const formData = await request.formData();
	const amountCents = parseAmountCents(formData);
	if (amountCents == null || amountCents < minDonationCents) {
		return new NextResponse(`Minimum donation is $${site.minDonationUsd}.`, { status: 400 });
	}

	const siteUrl = getSiteUrl(request);
	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		success_url: `${siteUrl}/download/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${siteUrl}/download`,
		line_items: [
			{
				price_data: {
					currency: site.stripeCurrency,
					unit_amount: amountCents,
					product_data: {
						name: `${site.title} — PDF & EPUB`,
						description: `Minimum donation unlocks downloadable formats of ${site.title}.`,
					},
				},
				quantity: 1,
			},
		],
	});

	if (!session.url) {
		return new NextResponse('Could not start checkout.', { status: 500 });
	}

	return NextResponse.redirect(session.url, 303);
}
