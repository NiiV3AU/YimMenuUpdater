// Holt die neuesten Release-Informationen aus dem YMU-Repository vor dem Build.
// Schreibt src/_data/release.json für Eleventy-Templates.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(
  new URL("../src/_data/release.json", import.meta.url),
);

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }
}

async function fetchLatestRelease() {
  let releaseData = null;

  // 1. Quelle: GitHub Releases API
  try {
    const res = await fetch(
      "https://api.github.com/repos/NiiV3AU/YMU/releases/latest",
      {
        headers: { "User-Agent": "YMU-Website-Build" },
        signal: AbortSignal.timeout(8_000),
      },
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.tag_name) {
        const tag = data.tag_name;
        const cleanVersion = tag.replace(/^v/, "");
        const shaMatch = (data.body || "").match(/\b[a-fA-F0-9]{64}\b/);
        const sha = shaMatch ? shaMatch[0].toLowerCase() : "";

        releaseData = {
          version: cleanVersion,
          cleanVersion: cleanVersion,
          tag: tag.startsWith("v") ? tag : `v${tag}`,
          name: data.name || `YMU ${tag}`,
          dateFormatted: formatDate(data.published_at),
          bannerId: `ymu-alert-${tag.toLowerCase().replace(/\./g, "-")}-release`,
          sha: sha,
          bodySnippet: (data.body || "").slice(0, 300),
          htmlUrl:
            data.html_url || `https://github.com/NiiV3AU/YMU/releases/latest`,
        };
        console.log(
          `release: fetched latest release ${tag} (${releaseData.dateFormatted})`,
        );
      }
    }
  } catch (err) {
    console.warn(`release: GitHub API fetch failed: ${err.message}`);
  }

  // 2. Fallback: paths.py im YMU-Repository
  if (!releaseData) {
    try {
      const res = await fetch(
        "https://raw.githubusercontent.com/NiiV3AU/YMU/main/src/core/paths.py",
        { signal: AbortSignal.timeout(6_000) },
      );
      if (res.ok) {
        const text = await res.text();
        const m = text.match(
          /LOCAL_VERSION\s*=\s*"v?([0-9]+\.[0-9]+\.[0-9]+)"/,
        );
        if (m) {
          const cleanVersion = m[1];
          const tag = `v${cleanVersion}`;
          releaseData = {
            version: cleanVersion,
            cleanVersion: cleanVersion,
            tag: tag,
            name: `YMU ${tag}`,
            dateFormatted: formatDate(new Date().toISOString()),
            bannerId: `ymu-alert-${tag.toLowerCase().replace(/\./g, "-")}-release`,
            sha: "",
            bodySnippet: "",
            htmlUrl: "https://github.com/NiiV3AU/YMU/releases/latest",
          };
          console.log(
            `release: extracted version ${tag} from paths.py fallback`,
          );
        }
      }
    } catch {}
  }

  if (releaseData) {
    let currentContent = null;
    try {
      currentContent = await readFile(OUT, "utf8");
    } catch {}

    const newContent = JSON.stringify(releaseData, null, 2) + "\n";
    if (currentContent !== newContent) {
      await writeFile(OUT, newContent, "utf8");
      console.log("release: updated src/_data/release.json");
    } else {
      console.log("release: src/_data/release.json is up-to-date");
    }
  } else {
    if (existsSync(OUT)) {
      console.warn(
        "release: could not fetch remote, keeping existing src/_data/release.json",
      );
    } else {
      // Notfall-Fallback
      const fallback = {
        version: "1.2.0",
        cleanVersion: "1.2.0",
        tag: "v1.2.0",
        name: "YMU v1.2.0",
        dateFormatted: "Oct 22, 2026",
        bannerId: "ymu-alert-v1-2-0-release",
        sha: "72389398346378578757e6fdba9693323f157af71b01c2b3284e8b26385a64d4",
        htmlUrl: "https://github.com/NiiV3AU/YMU/releases/latest",
      };
      await writeFile(OUT, JSON.stringify(fallback, null, 2) + "\n", "utf8");
      console.log("release: initialized default src/_data/release.json");
    }
  }
}

await fetchLatestRelease();
