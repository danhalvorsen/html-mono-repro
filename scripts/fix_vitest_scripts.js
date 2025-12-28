#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const targetFiles = [
  "Applications/audio/WebAudio/Multimedia/package.json",
  "packages/absolute.consistently.tests/package.json",
  "packages/core-event-system/core-drag-controller-abstract/package.json",
  "packages/core-event-system/core-drag-controller-dom/package.json",
  "packages/core-event-system/core-drag-controller-svg/package.json",
  "packages/core-event-system/core-drag-controller-threejs/package.json",
  "packages/core-filesystem/package.json",
  "packages/core-formatter/package.json",
  "packages/core-generators/package.json",
  "packages/core-graph/package.json",
  "packages/core-ioc/package.json",
  "packages/core-ioc-inversify/package.json",
  "packages/core-math/package.json",
  "packages/core-reactive-dom/package.json",
  "packages/core-template/package.json",
  "packages/core-template-handlebar/package.json",
  "packages/package.json",
  "packages/rendering-system-abstract/package.json",
  "packages/rendering-system-html5/package.json"
];

function replaceVitestInScript(cmd) {
  if (typeof cmd !== 'string') return cmd;
  // Normalize existing workspace invocations
  cmd = cmd.replace(/pnpm\s+-w\s+exec\s+vitest/g, 'pnpm --workspace-root vitest');
  cmd = cmd.replace(/pnpm\s+--workspace-root\s+vitest/g, 'pnpm --workspace-root vitest');
  // Replace standalone vitest with workspace call, but avoid duplicating if already replaced
  cmd = cmd.replace(/(^|\s)vitest(\b)/g, ' pnpm --workspace-root vitest');
  // collapse duplicated prefixes
  cmd = cmd.replace(/pnpm --workspace-root\s+pnpm --workspace-root/g, 'pnpm --workspace-root');
  return cmd.trim();
}

async function fixFile(root, rel) {
  const full = path.join(root, rel);
  let raw;
  try { raw = await fs.readFile(full, 'utf8'); } catch (e) { return null; }
  let obj;
  try { obj = JSON.parse(raw); } catch (e) { return null; }
  const scripts = obj.scripts || {};
  const modified = [];
  for (const [k, v] of Object.entries(scripts)) {
    if (typeof v === 'string' && /\bvitest\b/.test(v)) {
      const nv = replaceVitestInScript(v);
      if (nv !== v) {
        obj.scripts[k] = nv;
        modified.push({ script: k, before: v, after: nv });
      }
    }
  }
  if (modified.length) {
    // backup
    await fs.writeFile(full + '.bak', raw, 'utf8');
    await fs.writeFile(full, JSON.stringify(obj, null, 2) + '\n', 'utf8');
    return { file: rel, modified };
  }
  return null;
}

async function main() {
  const root = path.resolve(process.argv[2] || '.');
  const results = [];
  for (const rel of targetFiles) {
    const res = await fixFile(root, rel);
    if (res) results.push(res);
  }
  const outPath = path.join(root, 'tmp', 'fixed-vitest-scripts.json');
  await fs.mkdir(path.join(root, 'tmp'), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('WROTE', outPath);
}

main().catch(e => { console.error(e); process.exit(2); });
