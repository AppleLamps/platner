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

function renderHero(container) {
  const { meta } = LANDSCAPE;
  container.appendChild(el("section", { className: "hero card card-lg" }, [
    el("div", { className: "grid-hero" }, [
      el("div", { className: "stack-sm" }, [
        el("h1", { textContent: "Graham Platner on the Fediverse Progressive Left" }),
        el("p", {
          className: "muted",
          textContent: `${meta.subject} · Source: ${meta.source} · ${meta.note}`,
        }),
        el("div", { className: "callout callout-info" }, [
          el("p", {
            textContent:
              "The fediverse progressive left wants Platner's policies in the Senate and does not want Platner the person as a movement leader. Whether those can be separated long enough to beat Susan Collins without producing another Fetterman is the unresolved question.",
          }),
        ]),
      ]),
      el("div", { className: "stat-grid" }, [
        el("div", { className: "stat stat-info" }, [
          el("div", { className: "stat-value", textContent: "5 camps" }),
          el("div", { className: "stat-label", textContent: "Progressive-left clusters" }),
        ]),
        el("div", { className: "stat stat-success" }, [
          el("div", { className: "stat-value", textContent: "25 pages" }),
          el("div", { className: "stat-label", textContent: "feddit.dk search reviewed" }),
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
      textContent: "Estimated emphasis in progressive fediverse discourse on large instances — not vote share or polling.",
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
  const section = el("section", { className: "stack-sm" }, [
    el("h2", { textContent: "The five camps" }),
    el("p", {
      className: "section-caption",
      textContent: "Argument clusters from fediverse discourse - no individual voices. Camp sections are open by default for scanning.",
    }),
    el("div", { className: "grid-2" }),
  ]);
  const grid = section.querySelector(".grid-2");
  for (const camp of LANDSCAPE.camps) {
    const body = el("div", { className: "camp-body" }, [
      el("p", { innerHTML: `<strong>Theory of change:</strong> ${camp.theory}` }),
    ]);
    if (camp.forPoints.length) {
      body.appendChild(el("h4", { textContent: "Arguments for" }));
      const ol = el("ol");
      camp.forPoints.forEach((p, i) => ol.appendChild(el("li", { textContent: `${i + 1}. ${p}` })));
      body.appendChild(ol);
    }
    if (camp.againstPoints.length) {
      body.appendChild(el("h4", { textContent: "Arguments against" }));
      const ol = el("ol");
      camp.againstPoints.forEach((p, i) => ol.appendChild(el("li", { textContent: `${i + 1}. ${p}` })));
      body.appendChild(ol);
    }
    const details = el("details", { className: "camp-details", open: "" });
    const summary = el("summary");
    summary.setAttribute("data-emphasis", `${camp.emphasis}% emphasis`);
    summary.appendChild(swatch(camp.swatchColor));
    summary.appendChild(document.createTextNode(camp.name));
    details.appendChild(summary);
    details.appendChild(body);
    grid.appendChild(details);
  }
  section.appendChild(el("div", { className: "card" }, [
    el("p", {
      className: "muted",
      innerHTML:
        "<strong>Maine ground game note:</strong> Maine-adjacent voices emphasize town halls, yard signs, and anti-Washington mood over chronically online purity fights. National critics insist biography matters for a national Senate seat and movement credibility.",
    }),
  ]));
  section.appendChild(el("div", { className: "callout callout-info" }, [
    el("p", {
      textContent:
        "The strongest middle position is not \"trust Platner.\" It is \"use him if necessary, then make him earn trust over time through discipline, policy work, reparative accountability, and actual votes.\"",
    }),
  ]));
  container.appendChild(section);
}

function renderInstanceSplit(container) {
  const { instanceSplit, meta } = LANDSCAPE;
  container.appendChild(el("section", { className: "stack-sm card card-chart" }, [
    el("h2", { textContent: "Instance and space split" }),
    el("p", {
      className: "section-caption",
      textContent: `Estimated discourse lean by instance / space · Source: ${meta.source}`,
    }),
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
  const table = el("table", { className: "data-table" });
  const thead = el("thead");
  const hr = el("tr");
  ["Topic", "Pro-Platner / pragmatic", "Anti-Platner / skeptical"].forEach((h) =>
    hr.appendChild(el("th", { textContent: h }))
  );
  thead.appendChild(hr);
  table.appendChild(thead);
  const tbody = el("tbody");
  for (const row of debateMatrix) {
    const tr = el("tr");
    row.forEach((cell) => tr.appendChild(el("td", { textContent: cell })));
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(el("section", { className: "stack-sm" }, [
    el("h2", { textContent: "Recurring debate matrix" }),
    el("p", { className: "section-caption", textContent: `Core argument pairs mapped across camps · Source: ${meta.source}` }),
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
  container.appendChild(el("section", { className: "grid-timeline card card-chart" }, [
    el("div", { className: "stack-sm" }, [
      el("h2", { textContent: "Scandal timeline — discourse intensity" }),
      el("p", {
        className: "section-caption",
        textContent: `Relative discourse intensity over time · Intensity index 0–100 · Source: ${meta.source}`,
      }),
      renderTimelineChart(timeline),
      el("p", {
        className: "tertiary",
        textContent:
          "Oct–Nov 2025 tattoo and Reddit scandal set permanent camps. June 2026 abuse allegations deepened skepticism but did not collapse the pragmatic coalition — Heritage/Kavanaugh accuser framing pre-loaded.",
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
  const ihead = el("tr");
  ["Actor", "How discourse uses them"].forEach((h) => ihead.appendChild(el("th", { textContent: h })));
  instTable.appendChild(el("thead", {}, [ihead]));
  const ibody = el("tbody");
  for (const [actor, role] of institutionalLayer) {
    const tr = el("tr");
    tr.appendChild(el("td", { textContent: actor }));
    tr.appendChild(el("td", { textContent: role }));
    ibody.appendChild(tr);
  }
  instTable.appendChild(ibody);
  const ol = el("ol", { className: "consensus-list" });
  nearConsensus.forEach((item) => ol.appendChild(el("li", { textContent: item })));
  container.appendChild(el("section", { className: "stack-sm" }, [
    el("h2", { textContent: "Near-consensus and institutional layer" }),
    el("p", {
      className: "section-caption",
      textContent: "What nearly all camps accept, plus the outside validators and villains each side cites.",
    }),
    el("div", { className: "grid-2" }, [
      el("div", {}, [el("h3", { textContent: "What almost everyone agrees on" }), ol]),
      el("div", {}, [
        el("h3", { textContent: "How camps cite institutions" }),
        el("div", { className: "table-wrap" }, [instTable]),
      ]),
    ]),
    el("div", { className: "callout callout-warning" }, [
      el("p", {
        textContent:
          "Movement energy trends toward using Platner as an electoral vehicle (pragmatists, Maine organizers, institutional endorsements). Ideological energy trends toward treating support as a litmus-test failure (anti-imperialists, tattoo hardliners, anarchists). The bridge camp wants him watched, not celebrated.",
      }),
    ]),
    el("p", {
      className: "tertiary",
      textContent:
        "Synthesis from fediverse discourse research · Positions reflect what people argued, not verified fact about Platner's biography or future behavior · feddit page 26+ returns empty as of review date",
    }),
  ]));
}

export function renderLandscape(root) {
  root.innerHTML = "";
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
  root.appendChild(stack);
}
