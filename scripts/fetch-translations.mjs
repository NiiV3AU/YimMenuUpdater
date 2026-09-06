// Synchronisiert vor dem Build translations.json aus dem YMU-Repository.
// Läuft im Node/Cloudflare-Build und berührt keine Windows-EXE-Heuristiken.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../src/translations.json", import.meta.url));

const SOURCES = [
  "https://raw.githubusercontent.com/NiiV3AU/YMU/main/translations.json",
  "https://github.com/NiiV3AU/YMU/releases/latest/download/translations.json",
];

async function syncTranslations() {
  let remoteContent = null;

  for (const url of SOURCES) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "YMU-Website-Build" },
        signal: AbortSignal.timeout(8_000),
      });
      if (res.ok) {
        const text = await res.text();
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object" && parsed.en_US) {
          remoteContent = JSON.stringify(parsed, null, 2) + "\n";
          console.log(`translations: successfully fetched from ${url}`);
          break;
        }
      }
    } catch {
      // Weiter zur naechsten Quelle
    }
  }

  if (remoteContent) {
    let localContent = null;
    try {
      localContent = await readFile(OUT, "utf8");
    } catch {
      // Datei existiert lokal noch nicht
    }

    if (localContent !== remoteContent) {
      await writeFile(OUT, remoteContent, "utf8");
      console.log("translations: updated src/translations.json");
    } else {
      console.log("translations: src/translations.json is already up-to-date");
    }
  } else {
    if (existsSync(OUT)) {
      console.warn("translations: fetch failed, keeping existing local src/translations.json");
    } else {
      console.error("translations: fetch failed and no local src/translations.json found!");
      process.exit(1);
    }
  }
}

await syncTranslations();
