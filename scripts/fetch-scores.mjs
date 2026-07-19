// Aktualisiert vor dem Build die Score-Daten für die Footer-Chips:
// MotionScore-Grade (score.motion.dev) und Lighthouse-Scores (PageSpeed-
// Insights-API, frischer Audit der Live-URL pro Call, ~20-40s je Strategie).
// PSI läuft sequenziell mit Retry — parallele keylose Calls enden in 429;
// ohne PSI_API_KEY ist die Quota generell knapp (kostenloser Key:
// https://developers.google.com/speed/docs/insights/v5/get-started).
// Bei Fehlern bleibt je Teil der letzte eingecheckte Stand erhalten.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../src/_data/scores.json", import.meta.url));
// PSI misst die englische Content-Seite — die Root ist eine bewusst auf
// noindex stehende Sprachweiterleitung und würde SEO fälschlich drücken.
const TARGET = "https://ymu.pages.dev/en/";
const SITE = "ymu.pages.dev";
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const existing = await readFile(OUT, "utf8")
  .then(JSON.parse)
  .catch(() => ({}));
const scores = { ...existing };

try {
  const res = await fetch(
    `https://api.motion.dev/score/badge?url=${SITE}`,
    { signal: AbortSignal.timeout(15_000) },
  );
  const grade = (await res.text()).match(/MotionScore:\s*([A-Z][+-]?)/)?.[1];
  if (res.ok && grade) {
    scores.motion = grade;
    console.log("motion:", grade);
  }
} catch {
  console.warn("motion: fetch failed, keeping existing grade");
}

const psi = async (strategy) => {
  const api = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
  );
  api.searchParams.set("url", TARGET);
  api.searchParams.set("strategy", strategy);
  for (const c of CATEGORIES) api.searchParams.append("category", c);
  if (process.env.PSI_API_KEY) {
    api.searchParams.set("key", process.env.PSI_API_KEY);
  }
  const r = await fetch(api, { signal: AbortSignal.timeout(90_000) });
  if (!r.ok) throw new Error(`PSI ${strategy}: HTTP ${r.status}`);
  return r.json();
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const psiRetry = async (strategy) => {
  try {
    return await psi(strategy);
  } catch {
    await sleep(15_000);
    return psi(strategy);
  }
};

const score = (result, key) =>
  Math.round((result.lighthouseResult?.categories?.[key]?.score ?? 0) * 100);

try {
  const mobile = await psiRetry("mobile");
  const desktop = await psiRetry("desktop");
  const lh = {
    performance: Math.min(score(mobile, "performance"), score(desktop, "performance")),
    accessibility: Math.min(score(mobile, "accessibility"), score(desktop, "accessibility")),
    bestPractices: Math.min(score(mobile, "best-practices"), score(desktop, "best-practices")),
    seo: Math.min(score(mobile, "seo"), score(desktop, "seo")),
  };
  if (Object.values(lh).every((v) => v > 0)) {
    Object.assign(scores, lh, {
      fetchedAt: new Date().toISOString().slice(0, 10),
    });
    console.log("lighthouse:", JSON.stringify(lh));
  } else {
    console.warn("lighthouse: implausible scores, keeping existing values");
  }
} catch (e) {
  console.warn("lighthouse: fetch failed, keeping existing values —", String(e));
}

await writeFile(OUT, JSON.stringify(scores) + "\n");
