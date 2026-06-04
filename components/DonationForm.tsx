'use client';

import { useState } from 'react';
import { site } from '@/lib/site';

export default function DonationForm() {
	const [showCustom, setShowCustom] = useState(false);

	return (
		<form
			className="donation-panel"
			method="post"
			action="/api/checkout"
			onChange={(e) => {
				const target = e.target;
				if (target instanceof HTMLInputElement && target.name === 'amountUsd') {
					setShowCustom(target.value === 'custom');
				}
			}}
		>
			<fieldset>
				<legend>Choose your donation (USD)</legend>
				<div className="donation-amounts" role="radiogroup" aria-label="Donation amount">
					{site.suggestedDonationsUsd.map((amount, i) => (
						<label key={amount}>
							<input type="radio" name="amountUsd" value={amount} defaultChecked={i === 0} required />
							<span>${amount}</span>
						</label>
					))}
					<label>
						<input type="radio" name="amountUsd" value="custom" />
						<span>Custom</span>
					</label>
				</div>
				<div className="donation-custom" hidden={!showCustom}>
					<label htmlFor="customUsd">Custom amount (min ${site.minDonationUsd})</label>
					<span>$</span>
					<input
						type="number"
						id="customUsd"
						name="customUsd"
						min={site.minDonationUsd}
						step="1"
						defaultValue={site.minDonationUsd}
					/>
				</div>
			</fieldset>
			<p className="message-muted">
				You will complete payment on Stripe. After success, return here to download both formats.
			</p>
			<button className="btn" type="submit">
				Donate &amp; unlock downloads
			</button>
		</form>
	);
}
