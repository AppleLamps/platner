# Platner Research

Open-source political research on **Graham Platner**, Maine Democratic U.S. Senate candidate challenging Susan Collins. Includes an interactive fediverse discourse landscape and a full opposition research dossier.

## Contents

| Path | Description |
|------|-------------|
| [`index.html`](index.html) | Landing page |
| [`landscape.html`](landscape.html) | Interactive progressive-left landscape (vanilla JS port of Cursor canvas) |
| [`analysis.html`](analysis.html) | Opposition research dossier rendered from markdown |
| [`docs/platner.md`](docs/platner.md) | Full dossier source |
| [`js/data.js`](js/data.js) | Landscape data (shared with web port) |
| [`canvas/platner-left-landscape.canvas.tsx`](canvas/platner-left-landscape.canvas.tsx) | Cursor canvas source (IDE-only runtime) |
| [`output/pdf/platner-opposition-research.pdf`](output/pdf/platner-opposition-research.pdf) | PDF export |

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

## Data sync note

Cursor canvases must keep inline data (no relative imports). After editing the landscape:

1. Update [`canvas/platner-left-landscape.canvas.tsx`](canvas/platner-left-landscape.canvas.tsx) (Cursor IDE)
2. Mirror constants in [`js/data.js`](js/data.js) (web port)

## PDF generation

```bash
python scripts/build_platner_pdf.py
```

Output: `output/pdf/platner-opposition-research.pdf`

## License

Research synthesis for educational and political analysis purposes. Verify claims against primary sources before paid media or legal use.
