// Bundles the Electron main process (ESM) and preload (CJS) with esbuild.
import { build } from 'esbuild';

const common = {
  bundle: true,
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  alias: { '@shared': './shared' },
  logLevel: 'info',
};

await build({
  ...common,
  entryPoints: ['electron/main.ts'],
  outfile: 'dist-electron/main.mjs',
  format: 'esm',
  // Packages with WASM / worker files stay in node_modules so their relative paths resolve.
  external: ['electron', '@luau-rs/luau', 'sql.js'],
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});

await build({
  ...common,
  entryPoints: ['electron/translate-worker.ts'],
  outfile: 'dist-electron/translate-worker.mjs',
  format: 'esm',
  // Native ONNX runtime + sharp must load from node_modules (unpacked from the asar).
  external: ['electron', '@huggingface/transformers'],
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});

await build({
  ...common,
  entryPoints: ['electron/preload.ts'],
  outfile: 'dist-electron/preload.cjs',
  format: 'cjs',
  external: ['electron'],
});
