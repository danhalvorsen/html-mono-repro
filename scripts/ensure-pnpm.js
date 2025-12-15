const fs = require('fs');
const path = require('path');

function pnpmBinaryExists() {
  // common place: node_modules/pnpm/bin/pnpm.cjs
  const candidate = path.join(__dirname, '..', 'node_modules', 'pnpm', 'bin', 'pnpm.cjs');
  if (fs.existsSync(candidate)) return true;
  try {
    // try resolving via node resolution if hoisted differently
    require.resolve('pnpm/bin/pnpm.cjs');
    return true;
  } catch {
    return false;
  }
}

if (!pnpmBinaryExists()) {
  console.error('');
  console.error('⚠️  pnpm binary not found in workspace node_modules.');
  console.error('This repo expects pnpm for workspace scripts (pnpm -r).');
  console.error('');
  console.error('Quick fixes:');
  console.error('  1) Run from repo root:    pnpm install');
  console.error('  2) Or run bootstrap helper: pnpm run bootstrap');
  console.error('');
  console.error('If you rely on package-local pnpm installs, consider keeping pnpm at the root devDependencies and using public-hoist-pattern in .npmrc.');
  console.error('');
  // keep non-zero exit commented out by default so installs don't break unexpectedly
  // process.exit(1);
} else {
  // minimal confirmation (silenced in normal CI)
  // console.log('pnpm binary present');
}
