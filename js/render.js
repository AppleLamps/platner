import { LANDSCAPE } from "./data.js";

const SWATCH_CLASS = {
  green: "swatch-green",
  yellow: "swatch-yellow",
  pink: "swatch-pink",
  blue: "swatch-blue",
  gray: "swatch-gray",
};

const SEG_CLASS = {
  green: "seg-green",
  yellow: "seg-yellow",
  pink: "seg-pink",
  blue: "seg-blue",
  gray: "seg-gray",
};

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
  return el("span", { className: `swatch ${SWATCH_CLASS[color] || "swatch-gray"}` });
}

function usageBar(topLeft, topRight, segments, total = 100) {
  const track = el("div", { className: "usage-bar-track" });
  for (const seg of segments) {
    const width = (seg.value / total) * 100;
    track.appendChild(el("div", {
      className: `usage-bar-seg ${SEG_CLASS[seg.color] || ""}`,
      style: `width:${width}%`,
      title: `${seg.label || seg.id}: ${seg.value}%`,
    }));
  }
  return el("div", { className: "usage-bar" }, [
    el("div", { className: "usage-bar-labels" }, [
      el("span", { textContent: topLeft }),
      el("span", { textContent: topRight }),
    ]),
    track,
  ]);
}

function renderHero(container) {
  const { meta } = LANDSCAPE;
  container.appendChild(el("section", { className: "card card-lg" }, [
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
  const legend = el("div", { className: "stack-sm" });
  for (const s of campSpectrum.segments) {
    legend.appendChild(el("div", { className: "legend-row" }, [
      el("span", { className: "legend-left" }, [swatch(s.color), el("span", { textContent: s.label })]),
      el("span", { className: "tertiary", textContent: `${s.value}%` }),
    ]));
  }
  container.appendChild(el("div", { className: "grid-split" }, [
    el("section", { className: "card" }, [
      el("div", { className: "card-header", textContent: "Camp emphasis in discourse" }),
      usageBar("Estimated discourse emphasis", "100% of weighted commentary", campSpectrum.segments, campSpectrum.total),
      legend,
      el("p", {
        className: "tertiary",
        textContent: "Estimated emphasis in progressive fediverse discourse on large instances - not vote share or polling.",
      }),
    ]),
    renderStanceMapCard(meta),
  ]));
}

function renderStanceMapCard(meta) {
  const map = el("div", { className: "stance-map" });
  const axes = [
    { text: "Disqualify", style: "left:12px;bottom:10px" },
    { text: "Use electorally", style: "right:12px;bottom:10px" },
    { text: "More trust", style: "left:12px;top:10px" },
    { text: "Less trust", style: "left:12px;top:50%;transform:translateY(-50%)" },
  ];
  for (const a of axes) {
    const node = el("span", { className: "stance-map-axis", textContent: a.text });
    node.style.cssText = a.style;
    map.appendChild(node);
  }
  for (const p of LANDSCAPE.stanceMap) {
    const point = el("div", {
      className: "stance-point",
      style: `left:${p.x}%;top:${p.y}%`,
    }, [
      el("div", { className: "stance-point-title" }, [swatch(p.color), el("span", { textContent: p.label })]),
      el("div", { className: "tertiary", textContent: p.note }),
    ]);
    map.appendChild(point);
  }
  return el("section", { className: "card" }, [
    el("div", { className: "card-header", textContent: "Stance map" }),
    el("p", {
      className: "muted",
      textContent: `X-axis: disqualifying candidate → usable nominee · Y-axis: lower trust → higher movement trust · Source: ${meta.source}`,
    }),
    map,
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
  const section = el("section", { className: "stack-sm" }, [
    el("h2", { textContent: "Instance and space split" }),
    el("p", {
      className: "section-caption",
      textContent: `Estimated discourse lean by instance / space · Each bar: support % / reject % · Source: ${meta.source}`,
    }),
    el("div", { className: "instance-legend" }, [
      el("span", {}, [swatch("green"), " Support-leaning"]),
      el("span", {}, [swatch("pink"), " Reject-leaning"]),
    ]),
  ]);
  for (const row of instanceSplit) {
    section.appendChild(usageBar(row.label, `${row.support}% / ${row.reject}%`, [
      { id: "support", value: row.support, color: "green" },
      { id: "reject", value: row.reject, color: "pink" },
    ]));
  }
  section.appendChild(el("p", {
    className: "tertiary",
    textContent:
      "Two lefts talking past each other: lemmy.world leans pragmatic support; lemmy.ml leans hard rejection. Trans / identity-focused spaces hold a higher bar for leaders.",
  }));
  container.appendChild(section);
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
  const w = 640;
  const h = 200;
  const pad = { l: 40, r: 16, t: 16, b: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxY = 100;
  const pts = timeline.intensity.map((v, i) => {
    const x = pad.l + (i / (timeline.intensity.length - 1)) * innerW;
    const y = pad.t + innerH - (v / maxY) * innerH;
    return `${x},${y}`;
  }).join(" ");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("class", "timeline-chart");
  const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const fillPts = `${pad.l},${pad.t + innerH} ${pts} ${pad.l + innerW},${pad.t + innerH}`;
  poly.setAttribute("points", fillPts);
  poly.setAttribute("fill", "rgba(37,99,235,0.12)");
  svg.appendChild(poly);
  const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  line.setAttribute("points", pts);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#2563eb");
  line.setAttribute("stroke-width", "2");
  svg.appendChild(line);
  timeline.categories.forEach((cat, i) => {
    const x = pad.l + (i / (timeline.categories.length - 1)) * innerW;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", h - 8);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "10");
    text.setAttribute("fill", "#5c6570");
    text.textContent = cat;
    svg.appendChild(text);
  });
  const refY = pad.t + innerH - (90 / maxY) * innerH;
  const refLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  refLine.setAttribute("x1", pad.l);
  refLine.setAttribute("x2", pad.l + innerW);
  refLine.setAttribute("y1", refY);
  refLine.setAttribute("y2", refY);
  refLine.setAttribute("stroke", "#ca8a04");
  refLine.setAttribute("stroke-dasharray", "4,4");
  svg.appendChild(refLine);
  const events = el("ul", { className: "timeline-events" });
  for (const e of timeline.events) {
    events.appendChild(el("li", {}, [
      el("span", { className: "timeline-month", textContent: e.month }),
      el("div", {}, [
        el("div", { textContent: e.label }),
        el("div", { className: "timeline-note", textContent: e.note }),
      ]),
    ]));
  }
  container.appendChild(el("section", { className: "grid-timeline" }, [
    el("div", { className: "stack-sm" }, [
      el("h2", { textContent: "Scandal timeline - discourse intensity" }),
      el("p", {
        className: "section-caption",
        textContent: `Relative discourse intensity over time · X-axis: month · Y-axis: intensity index (relative, 0-100) · Source: ${meta.source}`,
      }),
      svg,
      el("p", {
        className: "tertiary",
        textContent:
          "Oct-Nov 2025 tattoo and Reddit scandal set permanent camps. June 2026 abuse allegations deepened skepticism but did not collapse the pragmatic coalition - Heritage/Kavanaugh accuser framing pre-loaded.",
      }),
    ]),
    el("div", {}, [el("h3", { textContent: "Key inflection points" }), events]),
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
