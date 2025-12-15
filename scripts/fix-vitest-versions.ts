import { readdir, readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '..');
const packagesDir = path.join(workspaceRoot, 'packages');

type SpecMap = Record<string, string | undefined>;

const targetKeys = ['vitest', '@vitest/ui', '@vitest/coverage-v8'];

async function readJson<T = Record<string, unknown>>(filePath: string): Promise<T> {
	return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

async function collectPackageJsons(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const result: string[] = [];
	for (const entry of entries) {
		if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
		const entryPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			const child = await collectPackageJsons(entryPath);
			result.push(...child);
		} else if (entry.isFile() && entry.name === 'package.json') {
			result.push(entryPath);
		}
	}
	return result;
}

async function fixPackageJson(filePath: string, specs: SpecMap): Promise<boolean> {
	const pkg = await readJson<{ devDependencies?: Record<string, string> }>(filePath);
	const devDeps = pkg.devDependencies ?? {};
	let dirty = false;

	for (const key of targetKeys) {
		const spec = specs[key];
		if (!spec) continue;

		if (devDeps[key] && devDeps[key] !== spec) {
			devDeps[key] = spec;
			dirty = true;
		}
	}

	if (!dirty) return false;

	await writeFile(
		filePath,
		JSON.stringify(
			{
				...pkg,
				devDependencies: devDeps,
			},
			null,
			2
		) + '\n',
		'utf8'
	);
	console.log(`Updated ${path.relative(workspaceRoot, filePath)}`);
	return true;
}

async function main() {
	const rootPkgPath = path.join(workspaceRoot, 'package.json');
	const rootPkg = await readJson<{ devDependencies?: Record<string, string> }>(rootPkgPath);
	const devDependencies = rootPkg.devDependencies ?? {};

	const specs: SpecMap = {
		vitest: devDependencies.vitest,
		'@vitest/ui': devDependencies['@vitest/ui'],
		'@vitest/coverage-v8': devDependencies['@vitest/coverage-v8'],
	};

	const packageJsons = await collectPackageJsons(packagesDir);
	let updated = 0;

	for (const pkgPath of packageJsons) {
		if (await fixPackageJson(pkgPath, specs)) {
			updated++;
		}
	}

	console.log(`Scanned ${packageJsons.length} package.json files; updated ${updated}.`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
