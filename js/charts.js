const PALETTE = {
  green: "#059669",
  yellow: "#d97706",
  pink: "#db2777",
  blue: "#2563eb",
  gray: "#64748b",
};

export function colorFor(key) {
  return PALETTE[key] || PALETTE.gray;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}


export function renderDonutChart(segments, { centerLabel = "", centerSub = "" } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "chart-wrap chart-donut";

  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 96;
  const innerR = 58;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  const svg = svgEl("svg", {
    viewBox: `0 0 ${size} ${size}`,
    role: "img",
    "aria-label": "Camp emphasis donut chart",
  });
  const title = svgEl("title");
  title.textContent = "Camp emphasis in discourse";
  svg.appendChild(title);

  let angle = -Math.PI / 2;
  segments.forEach((seg, i) => {
    const slice = (seg.value / total) * Math.PI * 2;
    const end = angle + slice;
    const large = slice > Math.PI ? 1 : 0;
    const x1 = cx + outerR * Math.cos(angle);
    const y1 = cy + outerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(end);
    const y2 = cy + outerR * Math.sin(end);
    const ix1 = cx + innerR * Math.cos(end);
    const iy1 = cy + innerR * Math.sin(end);
    const ix2 = cx + innerR * Math.cos(angle);
    const iy2 = cy + innerR * Math.sin(angle);
    const d = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");
    const path = svgEl("path", {
      d,
      fill: colorFor(seg.color),
      opacity: "0.92",
      class: "donut-seg",
    });
    path.dataset.label = seg.label;
    path.dataset.value = `${seg.value}%`;
    path.appendChild(svgEl("title"));
    path.querySelector("title").textContent = `${seg.label}: ${seg.value}%`;
    svg.appendChild(path);
    angle = end;
  });

  const center = svgEl("text", {
    x: cx,
    y: cy - (centerSub ? 4 : 0),
    "text-anchor": "middle",
    class: "donut-center-label",
  });
  center.textContent = centerLabel;
  svg.appendChild(center);
  if (centerSub) {
    const sub = svgEl("text", {
      x: cx,
      y: cy + 16,
      "text-anchor": "middle",
      class: "donut-center-sub",
    });
    sub.textContent = centerSub;
    svg.appendChild(sub);
  }

  wrap.appendChild(svg);
  return wrap;
}

export function renderStackedBar(segments, { total = 100, showLabels = true } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "chart-stacked-bar";

  const track = document.createElement("div");
  track.className = "stacked-bar-track";
  for (const seg of segments) {
    const pct = (seg.value / total) * 100;
    const part = document.createElement("div");
    part.className = "stacked-bar-seg";
    part.style.width = `${pct}%`;
    part.style.background = colorFor(seg.color);
    if (showLabels && pct >= 8) {
      part.textContent = `${seg.value}%`;
    }
    part.title = `${seg.label}: ${seg.value}%`;
    part.setAttribute("aria-label", `${seg.label}: ${seg.value}%`);
    track.appendChild(part);
  }
  wrap.appendChild(track);
  return wrap;
}

export function renderDivergingBars(rows) {
  const wrap = document.createElement("div");
  wrap.className = "chart-diverging";

  for (const row of rows) {
    const item = document.createElement("div");
    item.className = "diverging-row";
    item.setAttribute("aria-label", `${row.label}: ${row.reject}% reject-leaning, ${row.support}% support-leaning`);

    const label = document.createElement("div");
    label.className = "diverging-label";
    label.textContent = row.label;

    const bar = document.createElement("div");
    bar.className = "diverging-bar";

    const reject = document.createElement("div");
    reject.className = "diverging-reject";
    reject.style.flex = String(row.reject);
    const rejectLabel = document.createElement("span");
    rejectLabel.textContent = `${row.reject}%`;
    reject.appendChild(rejectLabel);

    const support = document.createElement("div");
    support.className = "diverging-support";
    support.style.flex = String(row.support);
    const supportLabel = document.createElement("span");
    supportLabel.textContent = `${row.support}%`;
    support.appendChild(supportLabel);

    bar.appendChild(reject);
    bar.appendChild(support);
    item.appendChild(label);
    item.appendChild(bar);
    wrap.appendChild(item);
  }
  return wrap;
}

export function renderScatterPlot(points) {
  const wrap = document.createElement("div");
  wrap.className = "chart-wrap chart-scatter";

  const w = 520;
  const h = 320;
  const pad = { l: 52, r: 24, t: 28, b: 44 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const svg = svgEl("svg", {
    viewBox: `0 0 ${w} ${h}`,
    role: "img",
    "aria-label": "Stance map scatter plot",
  });
  const title = svgEl("title");
  title.textContent = "Stance map by electability and movement trust";
  svg.appendChild(title);

  const defs = svgEl("defs");
  const gridPat = svgEl("pattern", { id: "grid", width: "40", height: "40", patternUnits: "userSpaceOnUse" });
  gridPat.appendChild(svgEl("path", { d: "M 40 0 L 0 0 0 40", fill: "none", stroke: "#e2e8f0", "stroke-width": "1" }));
  defs.appendChild(gridPat);
  svg.appendChild(defs);

  svg.appendChild(svgEl("rect", {
    x: pad.l,
    y: pad.t,
    width: innerW,
    height: innerH,
    fill: "url(#grid)",
    rx: "6",
  }));

  svg.appendChild(svgEl("line", {
    x1: pad.l,
    y1: pad.t + innerH / 2,
    x2: pad.l + innerW,
    y2: pad.t + innerH / 2,
    stroke: "#94a3b8",
    "stroke-width": "1.5",
  }));
  svg.appendChild(svgEl("line", {
    x1: pad.l + innerW / 2,
    y1: pad.t,
    x2: pad.l + innerW / 2,
    y2: pad.t + innerH,
    stroke: "#94a3b8",
    "stroke-width": "1.5",
  }));

  const axisLabels = [
    { text: "Disqualify", x: pad.l + 8, y: pad.t + innerH - 8, anchor: "start" },
    { text: "Use electorally", x: pad.l + innerW - 8, y: pad.t + innerH - 8, anchor: "end" },
    { text: "More trust", x: pad.l + 8, y: pad.t + 14, anchor: "start" },
    { text: "Less trust", x: pad.l + 8, y: pad.t + innerH / 2 + 4, anchor: "start" },
  ];
  for (const a of axisLabels) {
    const t = svgEl("text", {
      x: a.x,
      y: a.y,
      "text-anchor": a.anchor,
      class: "scatter-axis-label",
    });
    t.textContent = a.text;
    svg.appendChild(t);
  }

  for (const p of points) {
    const px = pad.l + (p.x / 100) * innerW;
    const py = pad.t + innerH - (p.y / 100) * innerH;
    const g = svgEl("g", { class: "scatter-point" });

    g.appendChild(svgEl("circle", {
      cx: px,
      cy: py,
      r: 10,
      fill: colorFor(p.color),
      opacity: "0.2",
    }));
    g.appendChild(svgEl("circle", {
      cx: px,
      cy: py,
      r: 5,
      fill: colorFor(p.color),
      stroke: "#fff",
      "stroke-width": "2",
    }));

    const label = svgEl("text", {
      x: px,
      y: py - 14,
      "text-anchor": "middle",
      class: "scatter-label",
    });
    label.textContent = p.label;
    g.appendChild(label);

    const note = svgEl("text", {
      x: px,
      y: py + 22,
      "text-anchor": "middle",
      class: "scatter-note",
    });
    note.textContent = p.note;
    g.appendChild(note);

    svg.appendChild(g);
  }

  wrap.appendChild(svg);
  return wrap;
}

export function renderTimelineChart(timeline) {
  const wrap = document.createElement("div");
  wrap.className = "chart-wrap chart-timeline";

  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.hidden = true;
  wrap.appendChild(tooltip);

  const w = 720;
  const h = 280;
  const pad = { l: 48, r: 20, t: 24, b: 40 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxY = 100;

  const svg = svgEl("svg", {
    viewBox: `0 0 ${w} ${h}`,
    role: "img",
    "aria-label": "Discourse intensity timeline",
  });
  const title = svgEl("title");
  title.textContent = "Relative discourse intensity over time";
  svg.appendChild(title);

  const grad = svgEl("linearGradient", { id: "areaGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
  grad.appendChild(svgEl("stop", { offset: "0%", "stop-color": "#2563eb", "stop-opacity": "0.35" }));
  grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": "#2563eb", "stop-opacity": "0.02" }));
  const defs = svgEl("defs");
  defs.appendChild(grad);
  svg.appendChild(defs);

  const yTicks = [0, 25, 50, 75, 90, 100];
  for (const tick of yTicks) {
    const y = pad.t + innerH - (tick / maxY) * innerH;
    svg.appendChild(svgEl("line", {
      x1: pad.l,
      y1: y,
      x2: pad.l + innerW,
      y2: y,
      stroke: tick === 90 ? "#d97706" : "#e2e8f0",
      "stroke-width": tick === 90 ? "1.5" : "1",
      "stroke-dasharray": tick === 90 ? "6 4" : "none",
      opacity: tick === 90 ? "0.8" : "1",
    }));
    const label = svgEl("text", {
      x: pad.l - 10,
      y: y + 4,
      "text-anchor": "end",
      class: "timeline-y-label",
    });
    label.textContent = tick;
    svg.appendChild(label);
    if (tick === 90) {
      const peakLabel = svgEl("text", {
        x: pad.l + innerW + 4,
        y: y + 4,
        class: "timeline-peak-label",
      });
      peakLabel.textContent = "Peaks";
      svg.appendChild(peakLabel);
    }
  }

  const coords = timeline.intensity.map((v, i) => ({
    x: pad.l + (i / (timeline.intensity.length - 1)) * innerW,
    y: pad.t + innerH - (v / maxY) * innerH,
    value: v,
    month: timeline.categories[i],
  }));

  const areaD = `${smoothPath(coords)} L ${coords[coords.length - 1].x} ${pad.t + innerH} L ${coords[0].x} ${pad.t + innerH} Z`;
  svg.appendChild(svgEl("path", { d: areaD, fill: "url(#areaGrad)" }));
  svg.appendChild(svgEl("path", {
    d: smoothPath(coords),
    fill: "none",
    stroke: "#2563eb",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  }));

  const eventMonths = new Set(timeline.events.map((e) => e.month));
  timeline.categories.forEach((cat, i) => {
    const x = pad.l + (i / (timeline.categories.length - 1)) * innerW;
    const [month, year] = cat.split(" ");
    const t = svgEl("text", {
      x,
      y: h - 12,
      "text-anchor": "middle",
      class: eventMonths.has(cat) ? "timeline-x-label timeline-x-event" : "timeline-x-label",
    });
    t.textContent = year ? `${month} '${year.slice(-2)}` : cat;
    svg.appendChild(t);

    if (eventMonths.has(cat)) {
      const ev = timeline.events.find((e) => e.month === cat);
      const y = pad.t + innerH - (timeline.intensity[i] / maxY) * innerH;
      svg.appendChild(svgEl("line", {
        x1: x,
        y1: pad.t,
        x2: x,
        y2: pad.t + innerH,
        stroke: "#94a3b8",
        "stroke-width": "1",
        "stroke-dasharray": "3 3",
        opacity: "0.5",
      }));
      const dot = svgEl("circle", {
        cx: x,
        cy: y,
        r: 6,
        fill: "#fff",
        stroke: "#2563eb",
        "stroke-width": "2.5",
        class: "timeline-dot",
      });
      dot.dataset.month = ev.month;
      dot.dataset.label = ev.label;
      dot.dataset.note = ev.note;
      dot.dataset.value = String(timeline.intensity[i]);
      svg.appendChild(dot);
    }
  });

  for (const c of coords) {
    const hit = svgEl("circle", {
      cx: c.x,
      cy: c.y,
      r: 14,
      fill: "transparent",
      class: "timeline-hit",
    });
    hit.dataset.month = c.month;
    hit.dataset.value = String(c.value);
    svg.appendChild(hit);
  }

  wrap.appendChild(svg);

  svg.addEventListener("mousemove", (e) => {
    const target = e.target.closest("[data-month]");
    if (!target) {
      tooltip.hidden = true;
      return;
    }
    const rect = wrap.getBoundingClientRect();
    tooltip.hidden = false;
    tooltip.innerHTML = target.dataset.label
      ? `<strong>${target.dataset.month}</strong><br>${target.dataset.label}<br><span class="tooltip-sub">${target.dataset.note}</span>`
      : `<strong>${target.dataset.month}</strong><br>Intensity: ${target.dataset.value}`;
    tooltip.style.left = `${e.clientX - rect.left}px`;
    tooltip.style.top = `${e.clientY - rect.top - 8}px`;
  });
  svg.addEventListener("mouseleave", () => {
    tooltip.hidden = true;
  });

  return wrap;
}
