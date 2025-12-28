const fs = require('fs');
const crypto = require('crypto');

function safe(v){
  if (v === undefined || v === null) return '';
  if (typeof v === 'object') {
    if (Array.isArray(v)) return v.join(',');
    const keys = Object.keys(v).sort();
    const o = {};
    for (const k of keys) o[k] = v[k];
    return JSON.stringify(o);
  }
  return String(v);
}

function computeXorFingerprintFromObject(cfg){
  const c = cfg.compilerOptions || {};
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
  while (parts.length < 10) parts.push('');
  const digests = parts.map(s => crypto.createHash('sha256').update(s, 'utf8').digest().slice(0,8));
  const out = Buffer.alloc(8,0);
  for (const d of digests) for (let i=0;i<8;i++) out[i] ^= d[i];
  return 'v1:xor-8:' + out.toString('hex');
}

function computeXorFingerprintFromFile(filePath){
  const cfg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return computeXorFingerprintFromObject(cfg);
}

function computeSha256Short(obj, bytes=8){
  const s = JSON.stringify(obj, Object.keys(obj).sort());
  const full = crypto.createHash('sha256').update(s,'utf8').digest();
  return full.slice(0, bytes).toString('hex');
}

module.exports = {
  computeXorFingerprintFromObject,
  computeXorFingerprintFromFile,
  computeSha256Short
};
