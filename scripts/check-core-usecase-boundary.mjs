// Core↔usecase boundary guard — core code must never import a concrete usecase
// module (src/usecases/<slug>/...). It may only read the registry barrel
// (index / _types / slugs). Mirrors the web app's guard.
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');

const CORE_DIRS = [
  'components',
  'config',
  'context',
  'hooks',
  'lib',
  'navigation',
  'screens',
  'services',
  'theme',
  'types',
];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      yield* walk(p);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      yield p;
    }
  }
}

const violations = [];
for (const coreDir of CORE_DIRS) {
  const dir = join(srcDir, coreDir);
  if (!existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const content = readFileSync(file, 'utf8');
    const rel = relative(srcDir, file).replace(/\\/g, '/');
    for (const m of content.matchAll(
      /from\s+['"]((?:\.\.?\/)*[^'"]*usecases\/[^'"]+)['"]/g,
    )) {
      const importPath = m[1];
      const normalized = importPath.replace(/^.*?usecases\//, 'usecases/');
      if (
        normalized === 'usecases/index' ||
        normalized === 'usecases/_types' ||
        normalized === 'usecases/slugs'
      ) {
        continue;
      }
      violations.push(`${rel}: imports ${importPath} (core → usecase boundary violation)`);
    }
  }
}

if (violations.length > 0) {
  console.error('Core↔usecase boundary violations:\n' + violations.join('\n'));
  process.exit(1);
}
console.log('Core↔usecase boundary clean.');
