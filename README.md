# Akshat Soni's website

An Astro portfolio and blog deployed to GitHub Pages. The homepage follows the Espresso & oat design in the supplied `akshat-portfolio` mock.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Astro. Before publishing, run `npm run build` (Astro type checks and builds the site). `npm run preview` serves the built output. Pushing to `master` triggers the GitHub Pages workflow in `.github/workflows/deploy.yaml`.

## Where to edit

- `src/pages/index.astro` builds the homepage and passes published articles to its scrolling writing cards, which link to their article pages.
- `src/styles/portfolio.css`, `public/portfolio.js`, and `public/portfolio-assets/` hold the homepage design, interactions, and local artwork.
- `src/content/blog/*.md` holds articles and frontmatter. `src/content/config.ts` defines the metadata. Article pages, the writing list, and RSS feed derive from this collection; tag metadata supplies category labels on homepage cards.
- `src/components/BaseHead.astro` supplies shared metadata; `astro.config.mjs` sets the production site URL and sitemap integration.

The photography collection uses labeled composition placeholders until actual photos and captions are supplied. Do not replace them with invented work.

## Check changes

After `npm run build`, check `/`, `/about`, `/blog`, an article under `/blog/`, and `/rss.xml`. On the homepage, check the hero, mobile ribbon, moving strips, article links, and photography dialog at desktop and 320–660px mobile widths. Check keyboard focus, Escape dismissal, and reduced-motion behavior.
