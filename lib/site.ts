export const site = {
	title: 'Agentic Design',
	author: 'Diego Packer Martins',
	authorUrl: 'https://www.linkedin.com/in/dpmartins',
	kicker: 'AI-Native. AI-Powered. AI-Ready.',
	tagline: 'From Blanding to Brand: Building Design Systems for the Age of Agents',
	description:
		'Agentic Design Systems (ADS) is a methodology for building design systems that are AI-native by design, AI-powered in practice, and AI-ready at every level. It is built on a single core insight: the component library was never really the product—the manifest is.',
	readOnlineNote:
		'Read the full book online for free; support the project with a minimum donation to download PDF and EPUB.',
	/** When true, middleware sends all traffic to /coming-soon. Set false after launch. */
	comingSoonGateEnabled: true,
	launchDateIso: '2026-06-05',
	launchDateLabel: 'June 5, 2026',
	minDonationUsd: 5,
	suggestedDonationsUsd: [5, 10, 25],
	stripeCurrency: 'usd',
} as const;

export const minDonationCents = site.minDonationUsd * 100;
