# Platner Research

Open-source political research on **Graham Platner**, Maine Democratic U.S. Senate candidate challenging Susan Collins. Interactive fediverse discourse landscape of progressive-left camps, debate axes, and scandal timeline.

## Contents

| Path | Description |
|------|-------------|
| [`index.html`](index.html) | Interactive progressive-left landscape (vanilla JS port of Cursor canvas) |
| [`js/data.js`](js/data.js) | Landscape data |
| [`assets/css/site.css`](assets/css/site.css) | Site styles |
| [`vercel.json`](vercel.json) | Vercel redirects and headers |

## Local preview

Static files must be served over HTTP.

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

[`vercel.json`](vercel.json) redirects legacy `/landscape` and `/analysis` URLs to `/`.

## License

Research synthesis for educational and political analysis purposes. Verify claims against primary sources before paid media or legal use.
