#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { computeXorFingerprintFromObject } = require('../src/index');

const basePath = process.argv[2] || path.join(__dirname, '..', '..', 'tsconfig.base.json');
if (!fs.existsSync(basePath)) { console.error('base tsconfig not found at', basePath); process.exit(2); }
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));

function deterministicChoice(i, salt, choices){
  const h = crypto.createHash('sha256').update(String(i)+':'+salt).digest();
  const idx = h[0] % choices.length;
  return choices[idx];
}

const targets = ['ES2019','ES2020','ES2021','ES2022','ESNext'];
const modules = ['ESNext','NodeNext','CommonJS'];
const resolutions = ['Node','NodeNext','Bundler'];
const outdirs = ['dist','build','lib','.','out'];
const libs = [['ES2020','DOM'], ['ES2021','DOM'], ['ES2019'], ['ES2022','DOM']];

const N = parseInt(process.env.TEST_N || '10000', 10);
const map = new Map();

for (let i=0;i<N;i++){
  const cfg = JSON.parse(JSON.stringify(base));
  cfg.compilerOptions = cfg.compilerOptions || {};
  cfg.compilerOptions.target = deterministicChoice(i,'t',targets);
  cfg.compilerOptions.module = deterministicChoice(i,'m',modules);
  cfg.compilerOptions.moduleResolution = deterministicChoice(i,'r',resolutions);
  cfg.compilerOptions.outDir = deterministicChoice(i,'o',outdirs);
  cfg.compilerOptions.rootDir = deterministicChoice(i,'rd',['.','src','lib']);
  cfg.compilerOptions.strict = (i % 2 === 0);
  cfg.compilerOptions.lib = deterministicChoice(i,'l',libs);
  if ((i % 5) === 0) {
    cfg.compilerOptions.paths = cfg.compilerOptions.paths || {};
    cfg.compilerOptions.paths['@gen/'+i+'/*'] = ['./generated/'+i+'/*'];
  }
  cfg.exclude = Array.isArray(cfg.exclude) ? cfg.exclude.slice() : ['node_modules','dist'];
  if ((i % 7) === 0) cfg.exclude.push('temp_'+i);

  const fp = computeXorFingerprintFromObject(cfg);
  if (!map.has(fp)) map.set(fp, []);
  if (map.get(fp).length < 5) map.get(fp).push({i, sample: cfg.compilerOptions});
}

let collisions = 0;
for (const [k,v] of map.entries()) if (v.length>1) collisions += v.length-1;

console.log('Generated:', N);
console.log('Unique fingerprints:', map.size);
console.log('Total collisions (extra items):', collisions);
if (collisions>0){
  console.log('Examples of collisions:');
  for (const [k,v] of map.entries()){
    if (v.length>1){
      console.log('Fingerprint:',k,'count:',v.length);
      console.log(JSON.stringify(v.slice(0,5),null,2));
      break;
    }
  }
} else {
  console.log('No collisions observed in this run.');
}
