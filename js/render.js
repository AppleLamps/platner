import { LANDSCAPE } from "./data.js";
import {
  renderDonutChart,
  renderStackedBar,
  renderDivergingBars,
  renderScatterPlot,
  renderTimelineChart,
  colorFor,
} from "./charts.js";

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") node.className = v;
    else if (k === "textContent") node.textContent = v;
    else if (k === "innerHTML") node.innerHTML = v;
    else if (k.startsWith("on")) node[k] = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function swatch(color) {
  return el("span", { className: "swatch", style: `background:${colorFor(color)}` });
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "camps", label: "Camps" },
  { id: "fediverse", label: "Fediverse" },
  { id: "debates", label: "Debates" },
  { id: "timeline", label: "Timeline" },
  { id: "consensus", label: "Consensus" },
];

function section(id, className, children) {
  return el("section", { id, className }, children);
}

function renderSectionNav() {
  const nav = document.getElementById("section-nav");
  if (!nav) return;
  nav.replaceChildren();
  for (const [index, { id, label }] of SECTIONS.entries()) {
    const link = el("a", { href: `#${id}`, textContent: label });
    if (index === 0) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
    nav.appendChild(link);
  }
}

function hydrateSectionNav() {
  const nav = document.getElementById("section-nav");
  if (!nav) return;
  const links = new Map(Array.from(nav.querySelectorAll("a")).map((link) => [link.hash.slice(1), link]));
  const setActive = (id) => {
    for (const [sectionId, link] of links) {
      const active = sectionId === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  };

  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) setActive(visible.target.id);
  }, {
    rootMargin: "-30% 0px -55% 0px",
    threshold: [0.1, 0.35, 0.6],
  });

  for (const { id } of SECTIONS) {
    const target = document.getElementById(id);
    if (target) observer.observe(target);
  }
}

function renderHero(container) {
  const { meta } = LANDSCAPE;
  container.appendChild(section("overview", "hero card card-lg", [
    el("div", { className: "grid-hero" }, [
      el("div", { className: "stack-sm" }, [
        el("p", { className: "eyebrow", textContent: "Progressive discourse synthesis" }),
        el("h1", { textContent: "Graham Platner — Progressive Left Discourse Landscape" }),
        el("p", { className: "muted", textContent: meta.subject }),
        el("div", { className: "source-badges" }, [
          el("span", { className: "badge badge-fediverse", textContent: "Fediverse · feddit.dk" }),
          el("span", { className: "badge badge-reddit", textContent: "Reddit · 6 threads" }),
        ]),
        el("p", { className: "tertiary hero-note", textContent: meta.note }),
        el("div", { className: "callout callout-info" }, [
          el("p", {
            textContent:
              "The fediverse progressive left wants Platner's policies in the Senate and does not want Platner the person as a movement leader. Reddit adds an electoral-pragmatism layer: Maine voters weighing Collins overperformance, Gideon polling trauma, and whether June 2026 scandals change the math. Whether policy and person can be separated long enough to beat Collins without producing another Fetterman is the unresolved question.",
          }),
        ]),
      ]),
      el("div", { className: "stat-grid" }, [
        el("div", { className: "stat stat-info" }, [
          el("div", { className: "stat-value", textContent: "5 camps" }),
          el("div", { className: "stat-label", textContent: "Progressive-left clusters" }),
        ]),
        el("div", { className: "stat stat-success" }, [
          el("div", { className: "stat-value", textContent: "2 sources" }),
          el("div", { className: "stat-label", textContent: "Fediverse + Reddit (6 threads)" }),
        ]),
        el("div", { className: "stat stat-warning" }, [
          el("div", { className: "stat-value", textContent: "Earn trust" }),
          el("div", { className: "stat-label", textContent: "Support is conditional, not settled" }),
        ]),
      ]),
    ]),
  ]));
}

function renderCampSpectrum(container) {
  const { campSpectrum, meta } = LANDSCAPE;
  const legend = el("div", { className: "donut-legend" });
  for (const s of campSpectrum.segments) {
    legend.appendChild(el("div", { className: "legend-row" }, [
      el("span", { className: "legend-left" }, [swatch(s.color), el("span", { textContent: s.label })]),
      el("span", { className: "legend-value", textContent: `${s.value}%` }),
    ]));
  }
  const donutCard = el("section", { className: "card" }, [
    el("div", { className: "card-header", textContent: "Camp emphasis in discourse" }),
    el("div", { className: "donut-layout" }, [
      renderDonutChart(campSpectrum.segments, { centerLabel: "5", centerSub: "camps" }),
      legend,
    ]),
    renderStackedBar(campSpectrum.segments, { total: campSpectrum.total }),
    el("p", {
      className: "tertiary",
      textContent: "Estimated emphasis in fediverse discourse on large instances — Reddit skews more pragmatic/electoral; not vote share or polling.",
    }),
  ]);
  container.appendChild(el("div", { className: "grid-split" }, [
    donutCard,
    renderStanceMapCard(meta),
  ]));
}

function renderStanceMapCard(meta) {
  return el("section", { className: "card" }, [
    el("div", { className: "card-header", textContent: "Stance map" }),
    el("p", {
      className: "muted",
      textContent: `X-axis: disqualifying candidate → usable nominee · Y-axis: lower trust → higher movement trust · Source: ${meta.source}`,
    }),
    renderScatterPlot(LANDSCAPE.stanceMap),
    el("p", {
      className: "tertiary",
      textContent:
        "The key pattern: most support clusters on the usable-nominee side, but almost no camp places Platner high on movement trust. The middle view is: use him if necessary, then make him prove it.",
    }),
  ]);
}

function renderCamps(container) {
  const campSection = section("camps", "stack-sm", [
    el("div", { className: "section-heading" }, [
      el("h2", { textContent: "The five camps" }),
      el("p", {
        className: "section-caption",
        textContent: "Argument clusters from fediverse and Reddit discourse — no individual voices. Top three camps open by default; expand others to scan.",
      }),
    ]),
    el("div", { className: "grid-2" }),
  ]);
  const grid = campSection.querySelector(".grid-2");
  for (const camp of LANDSCAPE.camps) {
    const body = el("div", { className: "camp-body" }, [
      el("p", { innerHTML: `<strong>Theory of change:</strong> ${camp.theory}` }),
    ]);
    if (camp.forPoints.length) {
      body.appendChild(el("h4", { textContent: "Arguments for" }));
      const ol = el("ol");
      camp.forPoints.forEach((p) => ol.appendChild(el("li", { textContent: p })));
      body.appendChild(ol);
    }
    if (camp.againstPoints.length) {
      body.appendChild(el("h4", { textContent: "Arguments against" }));
      const ol = el("ol");
      camp.againstPoints.forEach((p) => ol.appendChild(el("li", { textContent: p })));
      body.appendChild(ol);
    }
    const detailsAttrs = { className: "camp-details" };
    if (camp.emphasis >= 25) detailsAttrs.open = "";
    const details = el("details", detailsAttrs);
    const summary = el("summary");
    summary.setAttribute("data-emphasis", `${camp.emphasis}% emphasis`);
    summary.appendChild(swatch(camp.swatchColor));
    summary.appendChild(document.createTextNode(camp.name));
    details.appendChild(summary);
    details.appendChild(body);
    grid.appendChild(details);
  }
  campSection.appendChild(el("div", { className: "card" }, [
    el("p", {
      className: "muted",
      innerHTML:
        "<strong>Maine ground game note:</strong> Reddit's r/Maine voices emphasize town halls, all-ages base energy, and anti-Washington mood over chronically online purity fights. Many reject repeating the Sarah Gideon normie-Dem path after 2020. Skeptics counter that Collins overperforms polls and swing women may be alienated by sexting. National thread participants are often non-Mainers — Maine-local organizers treat ground game as the real signal.",
    }),
  ]));
  campSection.appendChild(el("div", { className: "callout callout-info" }, [
    el("p", {
      textContent:
        "The strongest middle position is not \"trust Platner.\" It is \"use him if necessary, then make him earn trust over time through discipline, policy work, reparative accountability, and actual votes.\"",
    }),
  ]));
  container.appendChild(campSection);
}

function renderInstanceSplit(container) {
  const { instanceSplit } = LANDSCAPE;
  container.appendChild(section("fediverse", "stack-sm card card-chart", [
    el("div", { className: "section-heading" }, [
      el("h2", { textContent: "Instance and space split" }),
      el("p", {
        className: "section-caption",
        textContent: "Estimated discourse lean by instance / space (fediverse only — Reddit lacks this ideological split) · Source: feddit.dk",
      }),
    ]),
    el("div", { className: "diverging-legend" }, [
      el("span", {}, [swatch("pink"), " Reject-leaning"]),
      el("span", {}, [swatch("green"), " Support-leaning"]),
    ]),
    renderDivergingBars(instanceSplit),
    el("p", {
      className: "tertiary",
      textContent:
        "Two lefts talking past each other: lemmy.world leans pragmatic support; lemmy.ml leans hard rejection. Trans / identity-focused spaces hold a higher bar for leaders.",
    }),
  ]));
}

function renderDebateMatrix(container) {
  const { debateMatrix, meta } = LANDSCAPE;
  const table = el("table", { className: "data-table debate-table" });
  table.appendChild(el("caption", { className: "sr-only", textContent: "Recurring pro-Platner and anti-Platner arguments by topic" }));
  const thead = el("thead");
  const hr = el("tr");
  ["Topic", "Pro-Platner / pragmatic", "Anti-Platner / skeptical"].forEach((h) =>
    hr.appendChild(el("th", { scope: "col", textContent: h }))
  );
  thead.appendChild(hr);
  table.appendChild(thead);
  const tbody = el("tbody");
  for (const row of debateMatrix) {
    const tr = el("tr");
    row.forEach((cell, i) => {
      const cellNode = el(i === 0 ? "th" : "td", { textContent: cell });
      if (i === 0) {
        cellNode.className = "topic-cell";
        cellNode.setAttribute("scope", "row");
      }
      tr.appendChild(cellNode);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(section("debates", "stack-sm", [
    el("div", { className: "section-heading" }, [
      el("h2", { textContent: "Recurring debate matrix" }),
      el("p", { className: "section-caption", textContent: `Core argument pairs mapped across camps · Source: ${meta.source}` }),
    ]),
    el("div", { className: "table-wrap" }, [table]),
  ]));
}

function renderTimeline(container) {
  const { timeline, meta } = LANDSCAPE;
  const events = el("ul", { className: "timeline-events" });
  for (const e of timeline.events) {
    events.appendChild(el("li", {}, [
      el("span", { className: "timeline-month", textContent: e.month }),
      el("div", {}, [
        el("div", { className: "timeline-event-label", textContent: e.label }),
        el("div", { className: "timeline-note", textContent: e.note }),
      ]),
    ]));
  }
  container.appendChild(section("timeline", "grid-timeline card card-chart", [
    el("div", { className: "stack-sm" }, [
      el("div", { className: "section-heading" }, [
        el("h2", { textContent: "Scandal timeline — discourse intensity" }),
        el("p", {
          className: "section-caption",
          textContent: `Relative discourse intensity over time · Intensity index 0–100 · Source: ${meta.source}`,
        }),
      ]),
      renderTimelineChart(timeline),
      el("p", {
        className: "tertiary",
        textContent:
          "Oct–Nov 2025 tattoo and Reddit history set permanent fediverse camps. June 2026 sexting disclosure and NYT exes piece dominated Reddit discourse at intensity matching the tattoo peak — pragmatic camp held via Collins/Gaza whataboutism; skeptics deepened electability concerns.",
      }),
    ]),
    el("div", { className: "timeline-sidebar" }, [
      el("h3", { textContent: "Key inflection points" }),
      events,
    ]),
  ]));
}

function renderFooter(container) {
  const { nearConsensus, institutionalLayer } = LANDSCAPE;
  const instTable = el("table", { className: "data-table" });
  instTable.appendChild(el("caption", { className: "sr-only", textContent: "Institutions and how discourse cites them" }));
  const ihead = el("tr");
  ["Actor", "How discourse uses them"].forEach((h) => ihead.appendChild(el("th", { scope: "col", textContent: h })));
  instTable.appendChild(el("thead", {}, [ihead]));
  const ibody = el("tbody");
  for (const [actor, role] of institutionalLayer) {
    const tr = el("tr");
    tr.appendChild(el("th", { scope: "row", className: "topic-cell", textContent: actor }));
    tr.appendChild(el("td", { textContent: role }));
    ibody.appendChild(tr);
  }
  instTable.appendChild(ibody);
  const ol = el("ol", { className: "consensus-list" });
  nearConsensus.forEach((item) => ol.appendChild(el("li", { textContent: item })));
  container.appendChild(section("consensus", "stack-sm", [
    el("div", { className: "section-heading" }, [
      el("h2", { textContent: "Near-consensus and institutional layer" }),
      el("p", {
        className: "section-caption",
        textContent: "What nearly all camps accept, plus the outside validators and villains each side cites.",
      }),
    ]),
    el("div", { className: "grid-2 consensus-grid" }, [
      el("div", { className: "consensus-col" }, [
        el("h3", { textContent: "What almost everyone agrees on" }),
        el("div", { className: "consensus-panel" }, [ol]),
      ]),
      el("div", { className: "consensus-col" }, [
        el("h3", { textContent: "How camps cite institutions" }),
        el("div", { className: "consensus-panel table-wrap" }, [instTable]),
      ]),
    ]),
    el("div", { className: "callout callout-warning" }, [
      el("p", {
        textContent:
          "Movement energy trends toward using Platner as an electoral vehicle (pragmatists, Maine organizers, institutional endorsements). Reddit amplifies Senate-flip instrumentalism and Gideon lessons; fediverse ideological energy trends toward treating support as a litmus-test failure (anti-imperialists, tattoo hardliners, anarchists). The bridge camp wants him watched, not celebrated.",
      }),
    ]),
    el("p", {
      className: "tertiary",
        textContent:
        "Synthesis from fediverse and Reddit discourse research · Positions reflect what people argued, not verified fact about Platner's biography or future behavior · Reddit scrape: 6 unique threads in reddit-platner/ · feddit page 26+ returns empty as of review date",
    }),
  ]));
}

function renderSiteFooter(container) {
  container.appendChild(el("footer", { className: "site-footer" }, [
    el("p", {
      className: "site-footer-disclaimer",
      textContent:
        "Research synthesis for educational and political analysis. Positions reflect what people argued in fediverse and Reddit discourse — not verified fact about Platner's biography or future behavior.",
    }),
    el("p", {
      className: "tertiary",
      textContent: "Verify claims against primary sources before paid media or legal use.",
    }),
  ]));
}

export function renderLandscape(root) {
  root.innerHTML = "";
  renderSectionNav();
  const stack = el("div", { className: "stack" });
  renderHero(stack);
  renderCampSpectrum(stack);
  stack.appendChild(el("hr", { className: "divider" }));
  renderCamps(stack);
  stack.appendChild(el("hr", { className: "divider" }));
  renderInstanceSplit(stack);
  stack.appendChild(el("hr", { className: "divider" }));
  renderDebateMatrix(stack);
  stack.appendChild(el("hr", { className: "divider" }));
  renderTimeline(stack);
  stack.appendChild(el("hr", { className: "divider" }));
  renderFooter(stack);
  renderSiteFooter(stack);
  root.appendChild(stack);
  hydrateSectionNav();
}
