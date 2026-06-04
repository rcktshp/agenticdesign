# Agentic Design — ebook site

A web-first ebook inspired by [Atomic Design](https://atomicdesign.bradfrost.com): read every chapter online for free, and unlock **PDF** and **EPUB** after a minimum donation via Stripe.

Built with **Next.js** (App Router).

## Features

- **Landing page** with cover, synopsis, and “Read now” / “Order ebook” actions
- **Table of contents** and **chapter reader** with sidebar navigation
- **Donation gate** — Stripe Checkout with preset or custom amounts (minimum configurable)
- **Protected downloads** — files live in `private/downloads/`, not `public/`
- **External links** in chapter Markdown open in a new tab

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3010](http://localhost:3010) (port **3010** avoids conflicting with other local Next.js sites on 3000).

### Early access (while coming soon is enabled)

With `comingSoonGateEnabled: true`, the public sees `/coming-soon`. Share the bypass URL from `lib/site.ts` (`previewBypassUrl`) with early readers — one visit sets a **7-day cookie**.

To rotate or revoke the link, change `previewBypassKey` in `lib/site.ts` and redeploy. Exit preview: `/preview/exit`.

### Test downloads without Stripe

In `.env`:

```
DEV_SKIP_DONATION=true
```

Then visit [http://localhost:3010/download/success?session_id=dev_bypass](http://localhost:3010/download/success?session_id=dev_bypass) (after placing PDF/EPUB files in `private/downloads/`).

## Stripe setup

1. Create a [Stripe](https://stripe.com) account and get **Secret key** (test mode is fine).
2. Set in `.env`:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL, e.g. `https://agenticdesign.example.com`)
3. Deploy with HTTPS. Stripe redirect URLs use `NEXT_PUBLIC_SITE_URL`.
4. Optional: add a webhook later for auditing; the app verifies `session_id` on each download.

## Add your book

| Task | Location |
|------|----------|
| Edit title, author, minimum donation | `lib/site.ts` |
| Chapters (Markdown) | `content/chapters/` |
| Import from Google Drive source | `npm run import-chapters` (see `scripts/import-chapters.mjs`) |
| PDF / EPUB files | `private/downloads/agentic-design.pdf`, `agentic-design.epub` |
| Cover art | `public/images/book-cover.svg` |

## Build & deploy

```bash
npm run build
npm start
```

Deploy to [Vercel](https://vercel.com), Railway, Render, Fly.io, or any Node host that runs Next.js.

## Design notes

Typography: **DM Serif Display** (headings), **DM Sans** (body), **DM Mono** (code). Palette inspired by [Stitch](https://stitch.withgoogle.com/). TOC layout follows Atomic Design: unnumbered foreword, orange chapter numbers, glossary as back matter.
