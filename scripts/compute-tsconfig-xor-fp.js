#!/usr/bin/env node
// Compute a compact XOR-based fingerprint from selected tsconfig fields.
// Note: XOR reduces digest size but increases collision risk. Use with awareness.
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const tsPath = process.argv[2] || path.join(__dirname, '..', 'tsconfig.base.json');
if (!fs.existsSync(tsPath)) {
  console.error('tsconfig not found at', tsPath);
  process.exit(2);
}

const cfg = JSON.parse(fs.readFileSync(tsPath, 'utf8'));

function safe(v){
  if (v === undefined || v === null) return '';
  if (typeof v === 'object') {
    if (Array.isArray(v)) return v.join(',');
    // stable stringify for objects
    const keys = Object.keys(v).sort();
    const o = {};
    for (const k of keys) o[k] = v[k];
    return JSON.stringify(o);
  }
  return String(v);
}

const c = cfg.compilerOptions || {};

// Pick up to 10 deterministic strings from the tsconfig to feed the xor-hash
const parts = [
  safe(c.target),
  safe(c.module),
  safe(c.moduleResolution),
  safe(c.outDir),
  safe(c.rootDir),
  safe(c.strict),
  Array.isArray(c.lib) ? c.lib.join(',') : safe(c.lib),
  safe(Object.keys(c.paths || {}).sort().join(',')),
  Array.isArray(cfg.exclude) ? cfg.exclude.join(',') : safe(cfg.exclude),
  safe(cfg.references || '')
];

// ensure exactly 10 items
while (parts.length < 10) parts.push('');

// For each part compute a stable SHA-256 digest and take first 8 bytes
const digests = parts.map(s => crypto.createHash('sha256').update(s, 'utf8').digest().slice(0, 8));

// XOR combine the 8-byte blocks into one 8-byte buffer
const out = Buffer.alloc(8, 0);
for (const d of digests) for (let i = 0; i < 8; i++) out[i] ^= d[i];

// Output as a short fingerprint. Format: v1:xor-8:<hex>
console.log('v1:xor-8:' + out.toString('hex'));

// Exit code 0
process.exit(0);
