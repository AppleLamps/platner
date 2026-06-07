import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  CollapsibleSection,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  LineChart,
  Pill,
  Row,
  Stack,
  Stat,
  Swatch,
  Table,
  Text,
  UsageBar,
  useHostTheme,
} from "cursor/canvas";
import type { Color, PillTone } from "cursor/canvas";

const meta = {
  source: "feddit.dk platner search, pages 1–25, sort=New",
  subject: "Graham Platner — Maine Democratic Senate candidate vs. Susan Collins",
  note: "Qualitative discourse weights, not polls or vote share",
};

const campSpectrum = {
  total: 100,
  segments: [
    { id: "pragmatic", value: 40, color: "green" as const, label: "Pragmatic harm-reduction" },
    { id: "skeptical", value: 25, color: "yellow" as const, label: "Skeptical conditional" },
    { id: "antiImp", value: 20, color: "pink" as const, label: "Hard anti-imperialist" },
    { id: "boosters", value: 10, color: "blue" as const, label: "Establishment-skeptic boosters" },
    { id: "anarchist", value: 5, color: "gray" as const, label: "Anarchist / anti-electoral" },
  ],
};

type Camp = {
  id: string;
  name: string;
  pillTone: PillTone;
  swatchColor: Color;
  emphasis: number;
  theory: string;
  forPoints: string[];
  againstPoints: string[];
};

const camps: Camp[] = [
  {
    id: "pragmatic",
    name: "Pragmatic harm-reduction",
    pillTone: "success",
    swatchColor: "green",
    emphasis: 40,
    theory: "Win seats with populist messaging, shift the Overton window, prove the establishment wrong.",
    forPoints: [
      "Best instrument to beat Collins and shift policy on M4A, Gaza, wealth tax, anti-AIPAC",
      "Scandals framed as hit jobs from AIPAC, pro-Collins money, GOP, and establishment oppo",
      "Mamdani parallel: scandal-heavy populist who wins if economic message lands",
      "Town halls, labor language, and local campaign work cited as real policy competence",
      "Redemption arc plausible — Marine to oyster farmer to anti-oligarch candidate",
      "Bernie, AFL-CIO, Common Defense endorsements cited as legitimacy",
    ],
    againstPoints: [
      "Internal caveats only: still flawed, not a trusted movement leader",
    ],
  },
  {
    id: "skeptical",
    name: "Skeptical conditional support",
    pillTone: "warning",
    swatchColor: "yellow",
    emphasis: 25,
    theory: "Vote Collins out if no alternative; do not invest movement capital; Fetterman proved words do not equal votes.",
    forPoints: [
      "Collins is worse on every policy measure",
      "Electoral harm reduction is distinct from movement trust",
      "Political Pascal's wager: small downside risk vs. large upside vs. Mills/Collins",
    ],
    againstPoints: [
      "Fetterman comparison is central trauma — same aesthetic, staff echoes, will betray on Gaza",
      "No Mamdani-style pedigree: no DSA chapter, no vouching network",
      "Tattoo hinge: ignorance or lying both disqualifying for Senate power",
      "Do not organize for him — watch like a hawk if voting",
      "Smith-Rodriguez / Costello alternatives with less baggage were not mobilized",
      "Trust has to be earned over time through discipline, accountability, and votes",
    ],
  },
  {
    id: "antiImp",
    name: "Hard anti-imperialist rejection",
    pillTone: "deleted",
    swatchColor: "pink",
    emphasis: 20,
    theory: "Electoral politics absorbs left energy; sheepdog candidates discredit the movement; real change is unions and organizing outside Democrats.",
    forPoints: [],
    againstPoints: [
      "Nazi tattoo + war participation + contractor work = cannot be redeemed into Senate leadership",
      "Supporting him legitimizes empire regardless of Collins",
      "Fight Agency + Schumer endorsement = sheepdog / manufactured authenticity",
      "Efficient MIC under Platner worse than incompetent zombie",
      "No clear apology or reparative accounting to Iraqis and Afghans harmed by US wars",
      "If politician does not show empathy abroad, they may not care about you either",
    ],
  },
  {
    id: "boosters",
    name: "Establishment-skeptic boosters",
    pillTone: "info",
    swatchColor: "blue",
    emphasis: 10,
    theory: "DNC tried to stop him and failed — that proves he threatens the establishment.",
    forPoints: [
      "Schumer/DSCC backed Mills; dirty oppo ran; Mills dropped when polls collapsed",
      "AIPAC / pro-Collins / corporate-Dem attacks prove he is a real threat",
      "Populist who survived scandal wave while holding policy line",
    ],
    againstPoints: [
      "Skeptics cite Schumer eventually working with Platner as proof he is inside the tent",
      "Fight Agency overlap with Fetterman staff fuels co-option fears",
    ],
  },
  {
    id: "anarchist",
    name: "Anarchist / anti-electoral",
    pillTone: "neutral",
    swatchColor: "gray",
    emphasis: 5,
    theory: "Forgiveness not owed; engage elections only to expose parliamentarism's limits.",
    forPoints: [],
    againstPoints: [
      "Democrats are the enemy — harm-reduction voting still absorbs left energy",
      "Leadership inappropriate for war veterans with this record",
      "No Senate power for someone who needs reparative work, not a campaign",
    ],
  },
];

const instanceSplit = [
  { label: "lemmy.world / progressivepolitics", support: 70, reject: 30 },
  { label: "lemmy.ml / ML-aligned", support: 15, reject: 85 },
  { label: "Trans / identity-focused", support: 40, reject: 60 },
];

const stanceMap = [
  { label: "Pragmatic", x: 78, y: 34, color: "green" as const, note: "Use him to beat Collins" },
  { label: "Skeptical", x: 55, y: 54, color: "yellow" as const, note: "Vote, but do not trust" },
  { label: "Boosters", x: 72, y: 18, color: "blue" as const, note: "Oppo proves he is real" },
  { label: "Hard anti", x: 18, y: 70, color: "pink" as const, note: "Disqualifying empire politics" },
  { label: "Anarchist", x: 10, y: 88, color: "gray" as const, note: "Reject the electoral bargain" },
];

const debateMatrix: Array<[string, string, string]> = [
  ["Totenkopf tattoo", "Ignorance; covered fast; obscure symbol", "Knew for years; lied; campaign staff knew"],
  ["Military history", "PTSD redemption; protested then served", "Volunteered to kill; re-enlisted; Blackwater; no reparative accounting"],
  ["Reddit history", "Outgrew 2009–2013; growth chronology", "Racism, homophobia, rape dismissals into 2020s"],
  ["Fetterman", "Different person; no prior political career", "Same staff; same aesthetic; will betray"],
  ["Fight Agency", "They fear him; coincidence with Mamdani", "Manufactured candidate; sheepdog"],
  ["Schumer tie", "Proves establishment feared him", "Proves he is inside the tent"],
  ["Policy vs. character", "Judge M4A, Gaza, wealth tax, town-hall competence", "Judge actions; words are cheap; trust must be earned"],
  ["Fifield / abuse", "GOP operative hit job", "Pattern of behavior across scandals"],
  ["Alternative candidates", "Collins / Mills only viable opponents", "Costello, Smith-Rodriguez, ranked choice unused"],
  ["Hegseth / Trump", "Hypocrisy to focus on Platner ink", "Platner undermines Nazi attacks on the right"],
];

const timeline = {
  categories: ["Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Jan 2026", "Apr 2026", "Jun 2026"],
  intensity: [25, 35, 95, 80, 45, 55, 70],
  events: [
    { month: "Aug 2025", label: "Campaign launch", note: "Early anti-imperialist skepticism" },
    { month: "Oct 2025", label: "Tattoo + Reddit peak", note: "Camps crystallize — permanent split" },
    { month: "Apr 2026", label: "Mills dropout", note: "Pragmatic camp vindicated" },
    { month: "Jun 2026", label: "NYT abuse / Fifield", note: "Pragmatic holds; skeptics deepen" },
  ],
};

const nearConsensus = [
  "Susan Collins is bad — even many anti-Platner voices prefer almost anyone to her",
  "Janet Mills was the wrong Democratic pick — Schumer recruitment seen as malpractice",
  "The Fetterman comparison haunts everything — both sides weaponize it",
  "Stated platform is left of typical Democrats — M4A, anti-AIPAC, Gaza, wealth tax",
  "No organized alternative emerged — Costello, Smith-Rodriguez, ranked-choice coalitions discussed but not built",
  "Biography is the battleground — not whether Maine needs a progressive senator in abstract",
  "Trust is conditional — many sympathetic voices still want discipline, accountability, and real votes",
];

const institutionalLayer: Array<[string, string]> = [
  ["Bernie Sanders", "Pragmatic legitimacy; skeptics wonder if endorsement erases red flags"],
  ["Working Families Party", "Endorsed; long internal critique of Fetterman-style laundering"],
  ["Schumer / DSCC", "Opposed Mills first; later worked with Platner — both sides cite"],
  ["Jacobin", "Bulk-of-posts defense for pragmatists; ML instances attack as lying"],
  ["AIPAC / pro-Collins PACs", "Funding opposition research — more common hit-job frame than direct intelligence claims"],
  ["Mamdani", "Survivable scandal template for defenders; authenticity benchmark Platner fails for skeptics"],
];

function SectionTitle({ title, caption }: { title: string; caption: string }) {
  return (
    <Stack gap={4}>
      <H2>{title}</H2>
      <Text tone="secondary" size="small">{caption}</Text>
    </Stack>
  );
}

function StanceMap() {
  const theme = useHostTheme();
  return (
    <Card>
      <CardHeader>Stance map</CardHeader>
      <CardBody>
        <Stack gap={12}>
          <Text tone="secondary" size="small">
            X-axis: disqualifying candidate → usable nominee · Y-axis: lower trust → higher movement trust · Source: {meta.source}
          </Text>
          <div
            style={{
              position: "relative",
              height: 260,
              border: `1px solid ${theme.stroke.secondary}`,
              background: theme.fill.tertiary,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                borderLeft: `1px solid ${theme.stroke.tertiary}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                borderTop: `1px solid ${theme.stroke.tertiary}`,
              }}
            />
            <Text
              size="small"
              tone="tertiary"
              style={{ position: "absolute", left: 12, bottom: 10 }}
            >
              Disqualify
            </Text>
            <Text
              size="small"
              tone="tertiary"
              style={{ position: "absolute", right: 12, bottom: 10 }}
            >
              Use electorally
            </Text>
            <Text
              size="small"
              tone="tertiary"
              style={{ position: "absolute", left: 12, top: 10 }}
            >
              More trust
            </Text>
            <Text
              size="small"
              tone="tertiary"
              style={{ position: "absolute", left: 12, top: 130 }}
            >
              Less trust
            </Text>
            {stanceMap.map((point) => (
              <div
                style={{
                  position: "absolute",
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: "translate(-50%, -50%)",
                  minWidth: 118,
                  border: `1px solid ${theme.stroke.secondary}`,
                  background: theme.bg.elevated,
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                <Row gap={6} align="center">
                  <Swatch color={point.color} />
                  <Text size="small" weight="semibold">{point.label}</Text>
                </Row>
                <Text size="small" tone="tertiary">{point.note}</Text>
              </div>
            ))}
          </div>
          <Text tone="tertiary" size="small">
            The key pattern: most support clusters on the usable-nominee side, but almost no camp places Platner high on movement trust. The middle view is: use him if necessary, then make him prove it.
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}

function CampBlock({ camp }: { camp: Camp }) {
  return (
    <CollapsibleSection
      title={camp.name}
      count={camp.emphasis}
      leading={<Swatch color={camp.swatchColor} />}
      trailing={<Pill tone={camp.pillTone} size="sm">{camp.emphasis}% emphasis</Pill>}
      defaultOpen
    >
      <Stack gap={10}>
        <Text size="small" tone="secondary">
          <Text weight="semibold">Theory of change: </Text>
          {camp.theory}
        </Text>
        {camp.forPoints.length > 0 && (
          <Stack gap={4}>
            <Text size="small" weight="semibold">Arguments for</Text>
            {camp.forPoints.map((p, i) => (
              <Text size="small" tone="secondary">{i + 1}. {p}</Text>
            ))}
          </Stack>
        )}
        {camp.againstPoints.length > 0 && (
          <Stack gap={4}>
            <Text size="small" weight="semibold">Arguments against</Text>
            {camp.againstPoints.map((p, i) => (
              <Text size="small" tone="secondary">{i + 1}. {p}</Text>
            ))}
          </Stack>
        )}
      </Stack>
    </CollapsibleSection>
  );
}

function InstanceSplitChart() {
  return (
    <Stack gap={18}>
      <Row gap={20} wrap>
        <Row gap={6} align="center">
          <Swatch color="green" />
          <Text size="small" tone="secondary">Support-leaning</Text>
        </Row>
        <Row gap={6} align="center">
          <Swatch color="pink" />
          <Text size="small" tone="secondary">Reject-leaning</Text>
        </Row>
      </Row>
      {instanceSplit.map((row) => (
        <UsageBar
          total={100}
          topLeftLabel={row.label}
          topRightLabel={`${row.support}% / ${row.reject}%`}
          segments={[
            { id: "support", value: row.support, color: "green" },
            { id: "reject", value: row.reject, color: "pink" },
          ]}
        />
      ))}
    </Stack>
  );
}

function TimelineAnnotations() {
  const theme = useHostTheme();
  return (
    <Stack gap={6}>
      {timeline.events.map((e) => (
        <Row gap={8} align="start">
          <Text size="small" weight="semibold" style={{ minWidth: 72, color: theme.accent.primary }}>
            {e.month}
          </Text>
          <Stack gap={2}>
            <Text size="small" weight="semibold">{e.label}</Text>
            <Text size="small" tone="tertiary">{e.note}</Text>
          </Stack>
        </Row>
      ))}
    </Stack>
  );
}

export default function PlatnerLeftLandscape() {
  return (
    <Stack gap={28}>
      <Card size="lg">
        <CardBody>
          <Grid columns="1.25fr 0.75fr" gap={20}>
            <Stack gap={8}>
              <H1>Graham Platner on the Fediverse Progressive Left</H1>
              <Text tone="secondary" size="small">
                {meta.subject} · Source: {meta.source} · {meta.note}
              </Text>
              <Callout tone="info">
                The fediverse progressive left wants Platner's policies in the Senate and does not want Platner the
                person as a movement leader. Whether those can be separated long enough to beat Susan Collins without
                producing another Fetterman is the unresolved question.
              </Callout>
            </Stack>
            <Grid columns={1} gap={10}>
              <Stat value="5 camps" label="Progressive-left clusters" tone="info" />
              <Stat value="25 pages" label="feddit.dk search reviewed" tone="success" />
              <Stat value="Earn trust" label="Support is conditional, not settled" tone="warning" />
            </Grid>
          </Grid>
        </CardBody>
      </Card>

      <Grid columns="0.9fr 1.1fr" gap={20}>
        <Card>
          <CardHeader>Camp emphasis in discourse</CardHeader>
          <CardBody>
            <Stack gap={14}>
              <UsageBar
                total={campSpectrum.total}
                topLeftLabel="Estimated discourse emphasis"
                topRightLabel="100% of weighted commentary"
                segments={campSpectrum.segments}
              />
              <Grid columns={1} gap={8}>
                {campSpectrum.segments.map((s) => (
                  <Row gap={6} align="center" justify="space-between">
                    <Row gap={6} align="center">
                      <Swatch color={s.color} />
                      <Text size="small" tone="secondary">{s.label}</Text>
                    </Row>
                    <Text size="small" tone="tertiary">{s.value}%</Text>
                  </Row>
                ))}
              </Grid>
              <Text tone="tertiary" size="small">
                Estimated emphasis in progressive fediverse discourse on large instances — not vote share or polling.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <StanceMap />
      </Grid>

      <Divider />

      <Stack gap={12}>
        <SectionTitle
          title="The five camps"
          caption="Argument clusters from fediverse discourse — no individual voices. Camp sections are open by default for scanning."
        />
        <Grid columns={2} gap={8}>
          {camps.map((camp) => (
            <CampBlock camp={camp} />
          ))}
        </Grid>
        <Card style={{ gridColumn: "1 / -1" }}>
          <CardBody>
            <Text size="small" tone="secondary">
              <Text weight="semibold">Maine ground game note: </Text>
              Maine-adjacent voices emphasize town halls, yard signs, and anti-Washington mood over chronically
              online purity fights. National critics insist biography matters for a national Senate seat and
              movement credibility.
            </Text>
          </CardBody>
        </Card>
        <Callout tone="info">
          Audit update: the strongest middle position is not “trust Platner.” It is “use him if necessary, then
          make him earn trust over time through discipline, policy work, reparative accountability, and actual votes.”
        </Callout>
      </Stack>

      <Divider />

      <Stack gap={10}>
        <SectionTitle
          title="Instance and space split"
          caption={`Estimated discourse lean by instance / space · Each bar: support % / reject % · Source: ${meta.source}`}
        />
        <InstanceSplitChart />
        <Text tone="tertiary" size="small">
          Two lefts talking past each other: lemmy.world leans pragmatic support; lemmy.ml leans hard rejection.
          Trans / identity-focused spaces hold a higher bar for leaders.
        </Text>
      </Stack>

      <Divider />

      <Stack gap={10}>
        <SectionTitle
          title="Recurring debate matrix"
          caption={`Core argument pairs mapped across camps · Source: ${meta.source}`}
        />
        <Table
          headers={["Topic", "Pro-Platner / pragmatic", "Anti-Platner / skeptical"]}
          rows={debateMatrix}
          columnAlign={["left", "left", "left"]}
          striped
        />
      </Stack>

      <Divider />

      <Grid columns="1.4fr 0.6fr" gap={24}>
        <Stack gap={10}>
          <SectionTitle
            title="Scandal timeline — discourse intensity"
            caption={`Relative discourse intensity over time · X-axis: month · Y-axis: intensity index (relative, 0–100) · Source: ${meta.source}`}
          />
          <LineChart
            categories={timeline.categories}
            series={[{ name: "Discourse intensity", data: timeline.intensity, tone: "info" }]}
            fill
            height={240}
            referenceLines={[
              { value: 90, label: "Oct 2025 peak", tone: "warning" },
            ]}
          />
          <Text tone="tertiary" size="small">
            Oct–Nov 2025 tattoo and Reddit scandal set permanent camps. June 2026 abuse allegations deepened
            skepticism but did not collapse the pragmatic coalition — Heritage/Kavanaugh accuser framing pre-loaded.
            Page 25 also mixes launch-era hits with later scandal comments attached to older search results.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Key inflection points</H3>
          <TimelineAnnotations />
        </Stack>
      </Grid>

      <Divider />

      <Stack gap={12}>
        <SectionTitle
          title="Near-consensus and institutional layer"
          caption="What nearly all camps accept, plus the outside validators and villains each side cites."
        />
        <Grid columns={2} gap={24}>
          <Stack gap={8}>
            <H3>What almost everyone agrees on</H3>
            {nearConsensus.map((item, i) => (
              <Text size="small" tone="secondary">{i + 1}. {item}</Text>
            ))}
          </Stack>
          <Stack gap={8}>
            <H3>How camps cite institutions</H3>
            <Table
              headers={["Actor", "How discourse uses them"]}
              rows={institutionalLayer}
              columnAlign={["left", "left"]}
              striped
            />
          </Stack>
        </Grid>
        <Callout tone="warning">
          Movement energy trends toward using Platner as an electoral vehicle (pragmatists, Maine organizers,
          institutional endorsements). Ideological energy trends toward treating support as a litmus-test failure
          (anti-imperialists, tattoo hardliners, anarchists). The bridge camp wants him watched, not celebrated.
        </Callout>
        <Text tone="tertiary" size="small">
          Synthesis from platner.md · Positions reflect what people argued, not verified fact about Platner's
          biography or future behavior · feddit page 26+ returns empty as of review date
        </Text>
      </Stack>
    </Stack>
  );
}
