# Pracownia Terapii i Rozwoju

React single-page application for [pracowniaterapii.com.pl](https://pracowniaterapii.com.pl). Shared navigation, layout, and booking details are rendered once; page-specific content and route metadata live in `src/content/`. Existing page URLs, WordPress-exported styles and media, and RSS feeds are retained.

## Develop

Install dependencies and start the Vite development server:

```sh
npm ci
npm run dev
```

## Build and deploy

Run `npm run build` to create the static site in `dist/`. GitHub Actions builds and deploys it to GitHub Pages when changes are pushed to `main`.
