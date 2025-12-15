// tools/scan-monorepo-diversity.ts
import fs from 'node:fs';
import path from 'node:path';

interface PackageInfo {
    name: string;
    folder: string;
    hasWebApis: boolean;
    hasNodeApis: boolean;
    fileTypes: Set<string>;
    usesVitestVersion: string | null;
    usesVite: boolean;
}

function readJSON(file: string) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
}

function detectAPIs(src: string): { node: boolean; web: boolean } {
    const content = fs.readFileSync(src, 'utf8');

    const webPatterns = [
        /document\./,
        /window\./,
        /HTMLElement/,
        /customElements/,
        /CanvasRenderingContext/,
        /WebGL/,
        /DOMParser/
    ];

    const nodePatterns = [
        /\bprocess\b/,
        /fs\./,
        /path\./,
        /Buffer/,
        /__dirname/,
        /require\(/,
    ];

    const isWeb = webPatterns.some(p => p.test(content));
    const isNode = nodePatterns.some(p => p.test(content));

    return { node: isNode, web: isWeb };
}

function scanPackage(packageDir: string): PackageInfo | null {
    const pkgPath = path.join(packageDir, 'package.json');
    const pkg = readJSON(pkgPath);
    if (!pkg) return null;

    const info: PackageInfo = {
        name: pkg.name ?? packageDir,
        folder: packageDir,
        hasWebApis: false,
        hasNodeApis: false,
        fileTypes: new Set<string>(),
        usesVitestVersion: null,
        usesVite: false,
    };

    // detect vitest version
    const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
    };

    if (deps['vitest']) info.usesVitestVersion = deps['vitest'];
    if (deps['vite']) info.usesVite = true;

    // scan src folder
    const srcDir = path.join(packageDir, 'src');
    if (!fs.existsSync(srcDir)) return info;

    const walk = (dir: string) => {
        for (const f of fs.readdirSync(dir)) {
            const full = path.join(dir, f);
            const stat = fs.statSync(full);

            if (stat.isDirectory()) {
                walk(full);
                continue;
            }

            const ext = path.extname(f);
            if (ext.startsWith('.ts')) info.fileTypes.add(ext);

            if (ext === '.ts' || ext === '.tsx' || ext === '.tsm') {
                const apis = detectAPIs(full);
                if (apis.web) info.hasWebApis = true;
                if (apis.node) info.hasNodeApis = true;
            }
        }
    };

    walk(srcDir);

    return info;
}

function scanMonorepo() {
    const root = process.cwd();
    const pkgsDir = path.join(root, ''); // scan root for workspaces

    const results: PackageInfo[] = [];

    for (const folder of fs.readdirSync(pkgsDir)) {
        const full = path.join(pkgsDir, folder);
        if (!fs.statSync(full).isDirectory()) continue;
        if (!fs.existsSync(path.join(full, 'package.json'))) continue;

        const info = scanPackage(full);
        if (info) results.push(info);
    }

    return results;
}

function printReport(pkgs: PackageInfo[]) {
    console.log('\n================ MONOREPO STANDARDIZATION REPORT ================\n');
    console.log('Packages found:', pkgs.length, '\n');

    for (const p of pkgs) {
        const type =
            p.hasWebApis && !p.hasNodeApis ? 'WEB'
            : p.hasNodeApis && !p.hasWebApis ? 'NODE'
            : p.hasWebApis && p.hasNodeApis ? 'MIXED — ⚠️ FIX NEEDED'
            : 'UNKNOWN';

        console.log(`📦 ${p.name}`);
        console.log(`│ Folder:       ${p.folder}`);
        console.log(`│ Type:         ${type}`);
        console.log(`│ File Types:   ${[...p.fileTypes].join(', ') || 'none'}`);
        console.log(`│ Vitest:       ${p.usesVitestVersion ?? 'none'}`);
        console.log(`│ Uses Vite:    ${p.usesVite ? 'YES' : 'no'}`);
        console.log('│ Web APIs:     ', p.hasWebApis);
        console.log('│ Node APIs:    ', p.hasNodeApis);
        console.log('└──────────────────────────────────────────────────────\n');
    }

    const diversity = {
        fileExtensions: [...new Set(pkgs.flatMap(p => [...p.fileTypes]))],
        vitestVersions: [...new Set(pkgs.map(p => p.usesVitestVersion).filter(Boolean))],
        hasMixedPackages: pkgs.some(p => p.hasWebApis && p.hasNodeApis)
    };

    console.log('================ SUMMARY ================');
    console.log('File Extensions in Use:', diversity.fileExtensions.join(', '));
    console.log('Vitest Versions:', diversity.vitestVersions.join(', '));
    console.log('Mixed Node/Web packages:', diversity.hasMixedPackages ? '⚠️ YES (fix required)' : 'No');
    console.log('=========================================\n');

    fs.writeFileSync('monorepo-scan.json', JSON.stringify(pkgs, null, 2));
}

const results = scanMonorepo();
printReport(results);
