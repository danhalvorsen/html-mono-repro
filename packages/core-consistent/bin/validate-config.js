#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { computeXorFingerprintFromFile } = require('../src/index');
const { createTemplate } = require('../src/template-adapter');

const tpl = createTemplate();

function diff(a, b, p = '') {
  const out = [];
  if (a === b) return out;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    out.push({ path: p || '.', before: a, after: b });
    return out;
  }
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of Array.from(keys).sort()) {
    out.push(...diff(a?.[k], b?.[k], p ? `${p}.${k}` : k));
  }
  return out;
}

function usage() {
  console.log(tpl.info('Usage: validate-config.js <file> [--baseline <file>] [--expected-fp <fingerprint>]'));
  console.log(tpl.info('If --expected-fp is provided, compares fingerprints and prints diff on mismatch.'));
  console.log(tpl.info('If --baseline is provided, compares file to baseline and prints diff.'));
}

const argv = process.argv.slice(2);
if (argv.length === 0) { usage(); process.exit(2); }

let file = argv[0];
let baseline = null;
let expectedFp = null;
for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--baseline' && argv[i+1]) { baseline = argv[i+1]; i++; }
  else if (a === '--expected-fp' && argv[i+1]) { expectedFp = argv[i+1]; i++; }
  else { console.warn('Unknown arg', a); }
}

file = path.resolve(process.cwd(), file);
if (!fs.existsSync(file)) { console.error('File not found:', file); process.exit(3); }

const fp = computeXorFingerprintFromFile(file);
console.log(tpl.info('fingerprint: ' + fp));

let mismatch = false;
if (expectedFp) {
  if (expectedFp !== fp) {
    console.error(tpl.error('EXPECTED FINGERPRINT MISMATCH'));
    mismatch = true;
  } else {
    console.log(tpl.success('Fingerprint matches expected value.'));
  }
}

if (baseline) {
  baseline = path.resolve(process.cwd(), baseline);
  if (!fs.existsSync(baseline)) { console.error('Baseline file not found:', baseline); process.exit(4); }
  const a = JSON.parse(fs.readFileSync(baseline,'utf8'));
  const b = JSON.parse(fs.readFileSync(file,'utf8'));
  const changes = diff(a,b);
  if (changes.length === 0) {
    console.log(tpl.success('No differences vs baseline'));
  } else {
    console.error(tpl.error('Differences vs baseline (showing up to 200 chars per value):'));
    console.error(tpl.formatDiffs(changes));
    mismatch = true;
  }
}

if (mismatch) {
  console.error('\n' + tpl.info('Hint: run with --baseline <expected-file> to see structured diffs, or use the computed fingerprint to update expected values if the change is intentional.'));
  process.exit(5);
}

process.exit(0);
