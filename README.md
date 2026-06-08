# Agentic Design — ebook site

A web-first ebook inspired by [Atomic Design](https://atomicdesign.bradfrost.com): read every chapter online for free.

Built with **Next.js** (App Router).

## Features

- **Landing page** with cover, synopsis, and “Read now” action
- **Table of contents** and **chapter reader**
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

## Add your book

| Task | Location |
|------|----------|
| Edit title, author, site copy | `lib/site.ts` |
| Chapters (Markdown) | `content/chapters/` |
| Import from Google Drive source | `npm run import-chapters` (see `scripts/import-chapters.mjs`) |
| Cover art | `public/images/book-cover.svg` |

## Build & deploy

```bash
npm run build
npm start
```

Deploy to [Vercel](https://vercel.com), Railway, Render, Fly.io, or any Node host that runs Next.js.

## Design notes

Typography: **DM Serif Display** (headings), **DM Sans** (body), **DM Mono** (code). Palette inspired by [Stitch](https://stitch.withgoogle.com/). TOC layout follows Atomic Design: unnumbered foreword, orange chapter numbers, glossary as back matter.
