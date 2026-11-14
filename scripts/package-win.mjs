/**
 * Builds the Windows installer.
 *
 *   npm run dist
 *
 * Why a staging folder: NSIS (makensis) is a 32-bit tool that fails on paths longer than 260 characters.
 * We stage only the files the app ships in a short temp path and build the installer there.
 * Runtime packages needed outside the bundles: @luau-rs/luau, sql.js and the offline translator
 * (@huggingface/transformers with its Windows x64 ONNX runtime). All renderer code is bundled by Vite into dist/.
 * The translation MODEL itself is not shipped: the student downloads it from inside the app if they want it.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const stage = path.join(os.tmpdir(), 'lumora-pkg');
const RUNTIME = ['@luau-rs/luau', 'sql.js', '@huggingface/transformers'];
// The Node build of transformers bundles the web runtime inline, so this 140 MB package is not needed.
const SKIP = new Set(['onnxruntime-web']);

/** Every installed production dependency of the runtime packages (recursively). */
function closure(names) {
  const seen = new Set();
  const visit = (name) => {
    if (seen.has(name) || SKIP.has(name)) return;
    const dir = path.join(root, 'node_modules', name);
    if (!fs.existsSync(path.join(dir, 'package.json'))) return; // optional dependency for another platform
    seen.add(name);
    const p = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    for (const dep of Object.keys({ ...p.dependencies, ...p.optionalDependencies })) visit(dep);
  };
  names.forEach(visit);
  return [...seen];
}

for (const required of ['dist/index.html', 'dist-electron/main.mjs', 'dist-electron/preload.cjs', 'assets/icon.png']) {
  if (!fs.existsSync(path.join(root, required))) throw new Error(`Missing ${required}. Run "npm run build" first.`);
}

fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
for (const dir of ['dist', 'dist-electron', 'assets']) fs.cpSync(path.join(root, dir), path.join(stage, dir), { recursive: true });
const shipped = closure(RUNTIME);
for (const dep of shipped) fs.cpSync(path.join(root, 'node_modules', dep), path.join(stage, 'node_modules', dep), { recursive: true });
// ONNX runtime ships binaries for every OS (~290 MB); keep only Windows x64.
const ortBin = path.join(stage, 'node_modules', 'onnxruntime-node', 'bin');
if (fs.existsSync(ortBin)) {
  for (const napi of fs.readdirSync(ortBin)) {
    for (const osDir of fs.readdirSync(path.join(ortBin, napi))) {
      if (osDir !== 'win32') fs.rmSync(path.join(ortBin, napi, osDir), { recursive: true, force: true });
      else for (const arch of fs.readdirSync(path.join(ortBin, napi, osDir))) if (arch !== 'x64') fs.rmSync(path.join(ortBin, napi, osDir, arch), { recursive: true, force: true });
    }
  }
}
console.log(`Shipping ${shipped.length} runtime packages`);

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
