const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targets = {
  'tsconfig.json': { parseJson: true },
  'tsconfig.test.json': { parseJson: true },
  'package.json': { parseJson: true },
  'vitest.config.ts': { parseJson: false },
};

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeys(value[key]);
    }
    return sorted;
  }
  return value;
}

function normalizeJson(text) {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(sortKeys(parsed));
  } catch {
    return text.trim();
  }
}

function normalizeTs(text) {
  const noComments = text
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  return noComments.replace(/\s+/g, ' ').trim();
}

const summary = new Map();
walk(root, (file) => {
  const name = path.basename(file);
  const target = targets[name];
  if (!target) return;
  const rel = path.relative(root, file);
  const content = fs.readFileSync(file, 'utf8');
  const key = target.parseJson ? normalizeJson(content) : normalizeTs(content);
  const mapForName = summary.get(name) || new Map();
  if (!mapForName.has(key)) {
    mapForName.set(key, { sample: rel, count: 0, snippet: content.slice(0, 400) });
  }
  const group = mapForName.get(key);
  group.count += 1;
  if (!Array.isArray(group.files)) group.files = [];
  group.files.push(rel);
  summary.set(name, mapForName);
});

for (const [name, groups] of summary.entries()) {
  console.log(`\n=== ${name} (${groups.size} unique) ===`);
  let idx = 1;
  for (const [key, group] of groups.entries()) {
    console.log(`\nGroup ${idx++} · ${group.count} file(s)`);
    console.log('Sample:', group.sample);
    console.log('Files (first 5):', group.files.slice(0, 5).join(', '));
    console.log('Snippet:');
    console.log(group.snippet);
  }
}

if (summary.size === 0) {
  console.log('No targeted config files found.');
}
