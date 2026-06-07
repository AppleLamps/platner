# Platner Research

Open-source political research on **Graham Platner**, Maine Democratic U.S. Senate candidate challenging Susan Collins. Includes an interactive fediverse discourse landscape and a full opposition research dossier.

## Contents

| Path | Description |
|------|-------------|
| [`index.html`](index.html) | Landing page |
| [`landscape.html`](landscape.html) | Interactive progressive-left landscape (vanilla JS port of Cursor canvas) |
| [`analysis.html`](analysis.html) | Opposition research dossier rendered from markdown |
| [`docs/platner.md`](docs/platner.md) | Full dossier source |
| [`js/data.js`](js/data.js) | Landscape data |
| [`assets/css/site.css`](assets/css/site.css) | Site styles |
| [`vercel.json`](vercel.json) | Vercel routing and headers |

## Local preview

Static files must be served over HTTP (`fetch` for markdown will not work from `file://`).

```bash
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:3000` (serve) or `http://localhost:8080`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Framework preset: **Other**
4. Build command: *(leave empty)*
5. Output directory: `.` (root)
6. Deploy.

[`vercel.json`](vercel.json) provides clean routes for `/landscape` and `/analysis`.

## License

Research synthesis for educational and political analysis purposes. Verify claims against primary sources before paid media or legal use.
