import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CSS_PATH = fileURLToPath(new URL("../_site/assets/css/style.css", import.meta.url));
const JSON_FILES = [
  fileURLToPath(new URL("../_site/site.webmanifest", import.meta.url)),
];
const FAVICON_SVG = fileURLToPath(new URL("../_site/favicon.svg", import.meta.url));

async function minifyAssets() {
  // 1. Minify CSS via lightningcss
  const source = await readFile(CSS_PATH);
  try {
    const { transform } = await import("lightningcss");
    const { code } = transform({
      filename: "style.css",
      code: source,
      minify: true,
    });
    await writeFile(CSS_PATH, code);
    console.log(`css: minified _site/assets/css/style.css (${source.length}B -> ${code.length}B)`);
  } catch {
    const fallback = source
      .toString("utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,>~])\s*/g, "$1")
      .replace(/;}/g, "}")
      .trim();
    await writeFile(CSS_PATH, fallback, "utf8");
    console.log(`css: minified _site/assets/css/style.css via fallback (${source.length}B -> ${Buffer.byteLength(fallback)}B)`);
  }

  // 2. Minify JSON passthrough files (translations.json, site.webmanifest)
  for (const jsonPath of JSON_FILES) {
    if (!existsSync(jsonPath)) continue;
    try {
      const raw = await readFile(jsonPath, "utf8");
      const min = JSON.stringify(JSON.parse(raw));
      await writeFile(jsonPath, min, "utf8");
      console.log(`json: minified ${jsonPath.split(/[\\/]/).pop()} (${Buffer.byteLength(raw)}B -> ${Buffer.byteLength(min)}B)`);
    } catch {}
  }

  // 3. Minify standalone favicon.svg via svgo
  if (existsSync(FAVICON_SVG)) {
    try {
      const { optimize } = await import("svgo");
      const rawSvg = await readFile(FAVICON_SVG, "utf8");
      const { data } = optimize(rawSvg, { multipass: true });
      await writeFile(FAVICON_SVG, data, "utf8");
      console.log(`svg: minified favicon.svg (${Buffer.byteLength(rawSvg)}B -> ${Buffer.byteLength(data)}B)`);
    } catch {}
  }
}

await minifyAssets();
