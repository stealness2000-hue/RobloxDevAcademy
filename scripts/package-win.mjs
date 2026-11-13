/**
 * Builds the Windows installer.
 *
 *   npm run dist
 *
 * Why a staging folder: NSIS (makensis) is a 32-bit tool that fails on paths longer than 260 characters.
 * We stage only the files the app ships in a short temp path and build the installer there.
 * Only two runtime packages are needed by the main process (@luau-rs/luau and sql.js); all renderer code
 * is already bundled by Vite into dist/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const stage = path.join(os.tmpdir(), 'rda-pkg');
const RUNTIME = ['@luau-rs/luau', 'sql.js'];

for (const required of ['dist/index.html', 'dist-electron/main.mjs', 'dist-electron/preload.cjs', 'assets/icon.png']) {
  if (!fs.existsSync(path.join(root, required))) throw new Error(`Missing ${required}. Run "npm run build" first.`);
}

fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
for (const dir of ['dist', 'dist-electron', 'assets', 'studio-plugin']) fs.cpSync(path.join(root, dir), path.join(stage, dir), { recursive: true });
for (const dep of RUNTIME) fs.cpSync(path.join(root, 'node_modules', dep), path.join(stage, 'node_modules', dep), { recursive: true });

const stagedPkg = {
  name: pkg.name,
  productName: pkg.productName,
  version: pkg.version,
  description: pkg.description,
  author: pkg.author,
  license: pkg.license,
  private: true,
  type: pkg.type,
  main: pkg.main,
  dependencies: Object.fromEntries(RUNTIME.map((d) => [d, pkg.dependencies[d]])),
  devDependencies: { electron: pkg.devDependencies.electron },
  build: { ...pkg.build, directories: { output: 'release', buildResources: 'assets' }, npmRebuild: false },
};
fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(stagedPkg, null, 2));

// electron-builder's NSIS templates must also live on a short path, so run a copy installed in a short tools folder.
const tools = path.join(os.tmpdir(), 'rda-tools');
const builderVersion = pkg.devDependencies['electron-builder'];
const toolsCli = path.join(tools, 'node_modules', 'electron-builder', 'cli.js');
const installed = fs.existsSync(toolsCli) && JSON.parse(fs.readFileSync(path.join(tools, 'node_modules', 'electron-builder', 'package.json'), 'utf8')).version === builderVersion;
if (!installed) {
  fs.mkdirSync(tools, { recursive: true });
  fs.writeFileSync(path.join(tools, 'package.json'), JSON.stringify({ name: 'rda-tools', private: true }));
  execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', `electron-builder@${builderVersion}`, '--prefer-offline', '--no-audit', '--no-fund'], { cwd: tools, stdio: 'inherit', shell: true });
}
execFileSync(process.execPath, [toolsCli, '--win', 'nsis', '--projectDir', stage], { stdio: 'inherit' });

const out = path.join(root, 'release');
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(path.join(stage, 'release'))) {
  if (f.endsWith('.exe') || f.endsWith('.blockmap') || f === 'latest.yml') fs.copyFileSync(path.join(stage, 'release', f), path.join(out, f));
}
// Keep the unpacked app too, for testing the packaged build without installing.
fs.rmSync(path.join(out, 'win-unpacked'), { recursive: true, force: true });
fs.cpSync(path.join(stage, 'release', 'win-unpacked'), path.join(out, 'win-unpacked'), { recursive: true });
console.log(`\nInstaller written to ${out}`);
