import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, '..', 'src', '_data', 'changelogs.json');
const RELEASE_FILE = path.join(__dirname, '..', 'src', '_data', 'release.json');

const REMOTE_URLS = [
  'https://raw.githubusercontent.com/NiiV3AU/YMU/main/CHANGELOG.md',
  'https://github.com/NiiV3AU/YMU/releases/latest/download/CHANGELOG.md',
];

const LOCAL_CANDIDATES = [
  path.join(__dirname, '..', '..', 'YMU', 'CHANGELOG.md'),
  path.join(__dirname, '..', '..', 'apps', 'YMU', 'CHANGELOG.md'),
  'B:/apps/YMU/CHANGELOG.md',
];

const MIN_VERSION = 'v1.1.5';

function parseSemver(v) {
  const clean = v.replace(/^v/, '');
  return clean.split('.').map((n) => parseInt(n, 10) || 0);
}

function isAtLeastMinVersion(version, min = MIN_VERSION) {
  const [majA, minA, patchA] = parseSemver(version);
  const [majB, minB, patchB] = parseSemver(min);

  if (majA !== majB) return majA > majB;
  if (minA !== minB) return minA > minB;
  return patchA >= patchB;
}

function parseChangelog(content) {
  const regex = /^##\s+\[(v?\d+\.\d+\.\d+)\]\s*-\s*(\d{4}-\d{2}-\d{2})\r?\n###\s+([^\r\n]+)\r?\n((?:>[^\r\n]*\r?\n?)+)/gm;

  let match;
  const entries = [];
  while ((match = regex.exec(content)) !== null) {
    const rawVersion = match[1];
    const version = rawVersion.startsWith('v') ? rawVersion : 'v' + rawVersion;

    if (!isAtLeastMinVersion(version)) {
      continue;
    }

    const rawDate = match[2];
    const title = '- ' + match[3].trim();
    const description = match[4]
      .split(/\r?\n/)
      .map((line) => line.replace(/^>\s?/, '').trim())
      .filter(Boolean)
      .join(' ');

    const d = new Date(rawDate + 'T00:00:00Z');
    const date = isNaN(d.getTime())
      ? rawDate
      : d.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          timeZone: 'UTC',
        });

    entries.push({ version, title, date, description });
  }
  return entries;
}

async function getChangelogContent() {
  for (const url of REMOTE_URLS) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'YMU-Website-Builder/1.0' },
      });
      if (res.ok) {
        console.log(`changelogs: fetched from ${url}`);
        return await res.text();
      }
    } catch (e) {
      // continue to next URL
    }
  }

  for (const localPath of LOCAL_CANDIDATES) {
    try {
      if (existsSync(localPath)) {
        console.log(`changelogs: loaded from local file ${localPath}`);
        return await readFile(localPath, 'utf8');
      }
    } catch (e) {
      // continue
    }
  }

  return null;
}

async function main() {
  const content = await getChangelogContent();
  let entries = [];

  if (content) {
    entries = parseChangelog(content);
    console.log(`changelogs: parsed ${entries.length} versions`);
  }

  if (existsSync(RELEASE_FILE)) {
    try {
      const release = JSON.parse(await readFile(RELEASE_FILE, 'utf8'));
      if (release && release.tag) {
        const found = entries.some(
          (e) => e.version.toLowerCase() === release.tag.toLowerCase()
        );
        if (!found) {
          console.log(`changelogs: prepending fallback placeholder for ${release.tag}`);
          const releaseName = release.name || '';
          const subtitle = releaseName.includes(' - ')
            ? '- ' + releaseName.split(' - ').slice(1).join(' - ')
            : '- Release ' + release.tag;
          entries.unshift({
            version: release.tag,
            title: subtitle,
            date: release.dateFormatted || 'Recent',
            description: `YMU ${release.tag} has been released. Full release notes are available on GitHub.`,
            isPlaceholder: true,
          });
        }
      }
    } catch (e) {
      console.warn('changelogs: error checking release.json:', e.message);
    }
  }

  if (entries.length === 0) {
    if (existsSync(OUT_FILE)) {
      console.warn('changelogs: could not fetch new changelogs; keeping existing changelogs.json');
      return;
    }
    console.error('changelogs: no changelog entries found and no cache exists');
    process.exit(1);
  }

  const json = JSON.stringify(entries, null, 2) + '\n';
  if (existsSync(OUT_FILE)) {
    const existing = await readFile(OUT_FILE, 'utf8');
    if (existing === json) {
      console.log('changelogs: src/_data/changelogs.json is already up-to-date');
      return;
    }
  }

  await writeFile(OUT_FILE, json, 'utf8');
  console.log(`changelogs: updated ${OUT_FILE} with ${entries.length} entries`);
}

main().catch((err) => {
  console.error('changelogs error:', err);
  process.exit(1);
});
