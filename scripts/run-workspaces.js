#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

class PackageInfo {
  constructor(dir, name, scripts) {
    this.dir = dir;
    this.name = name;
    this.scripts = scripts;
  }

  hasScript(scriptName) {
    return Boolean(this.scripts && this.scripts[scriptName]);
  }
}

class PackageLocator {
  constructor(root) {
    this.root = root;
    this.ignoreNames = new Set(['node_modules', '.pnpm-store', 'dist', '.git', 'tmp']);
  }

  findAll() {
    const packagesRoot = join(this.root, 'packages');
    const appsRoot = join(this.root, 'Applications');
    return [
      ...this.#scan(packagesRoot, { skipRoot: false }),
      ...this.#scan(appsRoot, { skipRoot: true }),
    ];
  }

  #scan(rootDir, { skipRoot }) {
    if (!existsSync(rootDir)) return [];
    const results = [];
    const stack = [rootDir];

    while (stack.length > 0) {
      const dir = stack.pop();
      if (!dir) continue;
      if (skipRoot && dir === rootDir) {
        // continue scanning children without treating root as a package
      } else if (existsSync(join(dir, 'package.json'))) {
        const pkg = this.#readPackage(dir);
        if (pkg) results.push(pkg);
        continue;
      }

      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (this.ignoreNames.has(entry.name)) continue;
        stack.push(join(dir, entry.name));
      }
    }

    return results;
  }

  #readPackage(dir) {
    const pkgPath = join(dir, 'package.json');
    try {
      const raw = readFileSync(pkgPath, 'utf8');
      const data = JSON.parse(raw);
      return new PackageInfo(dir, data.name || relative(this.root, dir), data.scripts || {});
    } catch (error) {
      console.warn(`Skipping ${dir}: ${error.message}`);
      return null;
    }
  }
}

class WorkspaceRunner {
  constructor(root, scriptName, extraArgs) {
    this.root = root;
    this.scriptName = scriptName;
    this.extraArgs = extraArgs;
    this.results = [];
  }

  run(packages) {
    for (const pkg of packages) {
      if (!pkg.hasScript(this.scriptName)) {
        this.results.push(this.#result(pkg, 'skipped', 0, 'script not found'));
        continue;
      }
      console.log(`\nRunning ${this.scriptName} in ${pkg.name}`);
      const result = spawnSync('pnpm', ['run', this.scriptName, ...this.extraArgs], {
        cwd: pkg.dir,
        encoding: 'utf8',
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });

      this.results.push(this.#result(pkg, result.status === 0 ? 'success' : 'failed', result.status ?? 1));
    }
  }

  summary() {
    const summary = { success: 0, failed: 0, skipped: 0 };
    for (const entry of this.results) summary[entry.status] += 1;
    return summary;
  }

  #result(pkg, status, exitCode, note) {
    return {
      name: pkg.name,
      directory: relative(this.root, pkg.dir),
      status,
      exitCode,
      note,
    };
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/run-workspaces.js <script> [args...]');
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scriptName = args[0];
const extraArgs = args.slice(1);

const locator = new PackageLocator(root);
const packages = locator.findAll();
const runner = new WorkspaceRunner(root, scriptName, extraArgs);

runner.run(packages);
const summary = runner.summary();
console.log(`\nDone. success=${summary.success} failed=${summary.failed} skipped=${summary.skipped}`);
