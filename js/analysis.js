const prose = document.getElementById("prose");

async function loadDossier() {
  try {
    const res = await fetch("/docs/platner.md");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    prose.classList.remove("prose-loading");
    prose.innerHTML = marked.parse(md);
  } catch (err) {
    prose.classList.remove("prose-loading");
    prose.classList.add("prose-error");
    prose.textContent = `Failed to load dossier: ${err.message}. Serve this site over HTTP (e.g. npx serve .).`;
  }
}

loadDossier();
