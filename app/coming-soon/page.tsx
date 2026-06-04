import type { Metadata } from 'next';
import styles from './coming-soon.module.css';
import { site } from '@/lib/site';

export const metadata: Metadata = {
	title: `Coming soon — ${site.title}`,
	description: `${site.title} launches ${site.launchDateLabel}.`,
};

export default function ComingSoonPage() {
	return (
		<main className={styles.page}>
			<div className={styles.content}>
				<p className={styles.badge}>Coming soon</p>
				<h1 className={styles.title}>
					<cite>{site.title}</cite>
				</h1>
				<p className={styles.kicker}>{site.kicker}</p>
				<p className={styles.date}>
					Launching <time dateTime={site.launchDateIso}>{site.launchDateLabel}</time>
				</p>
				<p className={styles.lead}>{site.tagline}</p>
			</div>
		</main>
	);
}
