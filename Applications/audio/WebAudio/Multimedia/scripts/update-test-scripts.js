#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pkgJsonPath = path.join(rootDir, 'package.json');
const pnpmWorkspacePath = path.join(rootDir, 'pnpm-workspace.yaml');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function findWorkspaceGlobs() {
  const rootPkg = readJson(pkgJsonPath);
  if (rootPkg.workspaces && Array.isArray(rootPkg.workspaces)) return rootPkg.workspaces;
  if (fs.existsSync(pnpmWorkspacePath)) {
    // basic parse to find packages array (fallback)
    const txt = fs.readFileSync(pnpmWorkspacePath, 'utf8');
    const match = txt.match(/packages:\s*\n([\s\S]*)/);
    if (match) {
      return match[1].split('\n').map(l => l.trim().replace(/^- ?['"]?/, '').replace(/['"]?$/, '')).filter(Boolean);
    }
  }
  return [];
}

function expandGlobs(globs) {
  // simple expansion for patterns like "Packages/*" and "composite-design-pattern"
  const dirs = new Set();
  for (const g of globs) {
    if (g.endsWith('/*')) {
      const base = path.join(rootDir, g.slice(0, -2));
      if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
        for (const name of fs.readdirSync(base)) {
          const p = path.join(base, name);
          if (fs.existsSync(path.join(p, 'package.json'))) dirs.add(p);
        }
      }
    } else {
      const p = path.join(rootDir, g);
      if (fs.existsSync(path.join(p, 'package.json'))) dirs.add(p);
    }
  }
  return Array.from(dirs);
}

function updatePackageTestScripts(pkgDir) {
  const pkgPath = path.join(pkgDir, 'package.json');
  const pkg = readJson(pkgPath);
  const relConfigPath = path.relative(pkgDir, path.join(rootDir, 'vitest.config.ts')).split(path.sep).join('/');
  const configArg = relConfigPath ? `--config ${relConfigPath}` : '';
  const testCmd = `pnpm -w exec vitest ${configArg}`.trim();
  const testWatchCmd = `pnpm -w exec vitest ${configArg} --watch`.trim();

  pkg.scripts = pkg.scripts || {};
  let changed = false;
  if (pkg.scripts.test !== testCmd) {
    pkg.scripts.test = testCmd;
    changed = true;
  }
  if (pkg.scripts['test:watch'] !== testWatchCmd) {
    pkg.scripts['test:watch'] = testWatchCmd;
    changed = true;
  }

  // ensure there's a tsconfig.test.json reference hint (non-destructive)
  if (!pkg.tsconfigTestHint) {
    // optional: store a hint so re-run can be idempotent without adding more fields
    pkg.tsconfigTestHint = true;
    // do not treat this as a test-script change
  }

  if (changed) {
    writeJson(pkgPath, pkg);
    console.log(`Updated test scripts in ${path.relative(rootDir, pkgPath)}`);
  } else {
    console.log(`No change for ${path.relative(rootDir, pkgPath)}`);
  }
}

function ensureRootTestScript() {
  const rootPkg = readJson(pkgJsonPath);
  rootPkg.scripts = rootPkg.scripts || {};
  const desired = 'pnpm -r --parallel run test';
  if (rootPkg.scripts.test !== desired) {
    rootPkg.scripts.test = desired;
    writeJson(pkgJsonPath, rootPkg);
    console.log('Updated root package.json "test" script');
  } else {
    console.log('Root package.json "test" script already correct');
  }
}

// new helper: perform a folder move (source and destination are relative to repo root)
function performMoveIfRequested() {
  const argv = process.argv.slice(2);
  const fromIndex = argv.indexOf('--move-from');
  const toIndex = argv.indexOf('--move-to');
  if (fromIndex === -1 && toIndex === -1) return; // no move requested

  if (fromIndex === -1 || toIndex === -1) {
    console.error('Both --move-from and --move-to must be provided to perform a move.');
    process.exitCode = 3;
    process.exit();
  }

  const moveFrom = argv[fromIndex + 1];
  const moveTo = argv[toIndex + 1];
  if (!moveFrom || !moveTo) {
    console.error('Invalid --move-from or --move-to value.');
    process.exitCode = 4;
    process.exit();
  }

  const src = path.join(rootDir, moveFrom);
  const dest = path.join(rootDir, moveTo);

  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    console.error(`Source folder does not exist or is not a directory: ${src}`);
    process.exitCode = 5;
    process.exit();
  }
  if (fs.existsSync(dest)) {
    console.error(`Destination already exists: ${dest}`);
    process.exitCode = 6;
    process.exit();
  }

  // attempt move (rename)
  try {
    fs.renameSync(src, dest);
    console.log(`Moved folder: ${moveFrom} -> ${moveTo}`);
    // If pnpm-workspace.yaml exists and lists the source explicitly, try to update it.
    if (fs.existsSync(pnpmWorkspacePath)) {
      let txt = fs.readFileSync(pnpmWorkspacePath, 'utf8');
      const updated = txt.replace(new RegExp(`(^\\s*-\\s*['"]?)${escapeForRegex(moveFrom)}(['"]?\\s*$)`, 'm'), `$1${moveTo}$2`);
      if (updated !== txt) {
        fs.writeFileSync(pnpmWorkspacePath, updated, 'utf8');
        console.log(`Updated pnpm-workspace.yaml entry: ${moveFrom} -> ${moveTo}`);
      }
    }
    // Also update root package.json workspaces array if it contains the source path
    const rootPkg = readJson(pkgJsonPath);
    if (Array.isArray(rootPkg.workspaces)) {
      let changed = false;
      rootPkg.workspaces = rootPkg.workspaces.map(w => {
        if (w === moveFrom) { changed = true; return moveTo; }
        return w;
      });
      if (changed) {
        writeJson(pkgJsonPath, rootPkg);
        console.log(`Updated root package.json workspace entry: ${moveFrom} -> ${moveTo}`);
      }
    }
  } catch (err) {
    console.error('Failed to move folder:', err);
    process.exitCode = 7;
    process.exit();
  }
}

function escapeForRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

(async function main(){
  try {
    // if requested, move a folder first
    performMoveIfRequested();

    const globs = findWorkspaceGlobs();
    if (!globs.length) {
      console.error('No workspace globs found in root package.json or pnpm-workspace.yaml');
      process.exitCode = 1;
      return;
    }
    const pkgDirs = expandGlobs(globs);
    if (!pkgDirs.length) {
      console.error('No package folders found for workspace globs:', globs);
      process.exitCode = 1;
      return;
    }
    // Update each package
    for (const d of pkgDirs) updatePackageTestScripts(d);
    // Ensure root test script follows the workspace-run pattern
    ensureRootTestScript();
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 2;
  }
})();
