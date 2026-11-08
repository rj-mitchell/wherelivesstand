// Checks the family kit copied into public/family/ (docs/DESIGN.md), without the charity's repository:
//
// - VERSION is there, for this site ("site lives") and served at /family/, from the kit version the build
//   expects (KIT below; change it when the kit is synced to a new version);
// - every file the build reads is there (vite.config.ts and scripts/postbuild.mjs);
// - the files hash to the sha256 that VERSION records, as the kit's sync.mjs computes it, so a copy edited
//   by hand, or a sync left half done, fails.
//
// The full check, that the copy matches the kit itself, needs the charity's repository and is run before
// merging (README, "Before merging"):
//   node <charity>/family/kit/sync.mjs --site lives --out public/family --check
//
// Plain Node with no dependencies. Exits 1 and says what is wrong.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = '1.2.1';
const SITE = 'lives';
const BASE = '/family/';
const NEEDED = ['head.html', 'endorsement.html', 'shelf.html', 'favicon.ico', 'family.css', 'fonts.css'];

const dir = fileURLToPath(new URL('../public/family/', import.meta.url));
const problems = [];
const versionPath = join(dir, 'VERSION');

if (!existsSync(versionPath)) {
  problems.push('public/family/VERSION is missing: sync the family kit (docs/DESIGN.md).');
} else {
  const fields = Object.fromEntries(
    readFileSync(versionPath, 'utf8')
      .split('\n')
      .map(line => line.match(/^(kit|site|base|sha256) (.+)$/))
      .filter(Boolean)
      .map(m => [m[1], m[2].trim()]),
  );
  if (fields.kit !== KIT) problems.push(`the kit in public/family is ${fields.kit ?? 'of no version'}; the build expects ${KIT} (scripts/check-family.mjs).`);
  if (fields.site !== SITE) problems.push(`public/family was synced for "${fields.site}", not "${SITE}".`);
  if (fields.base !== BASE) problems.push(`public/family was synced for ${fields.base}, not ${BASE}.`);

  for (const f of NEEDED) if (!existsSync(join(dir, f))) problems.push(`public/family/${f} is missing.`);

  // The same hash as the kit's sync.mjs: each file's path and contents, in path order, VERSION left out
  const files = [];
  const walk = d => {
    for (const name of readdirSync(d)) {
      const path = join(d, name);
      if (statSync(path).isDirectory()) walk(path);
      else files.push(relative(dir, path).split(sep).join('/'));
    }
  };
  walk(dir);
  const hash = createHash('sha256');
  for (const path of files.filter(p => p !== 'VERSION').sort()) {
    hash.update(path).update('\0').update(readFileSync(join(dir, path))).update('\0');
  }
  const actual = hash.digest('hex');
  if (fields.sha256 !== actual) {
    problems.push('the files in public/family do not match the hash in its VERSION: a copy was edited, or a sync is incomplete. Sync the kit again.');
  }
}

if (problems.length) {
  console.error('Family kit check failed:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`Family kit check passed: kit ${KIT} for "${SITE}" in public/family.`);
