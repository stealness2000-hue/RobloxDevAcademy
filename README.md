# Lumora Academy

A Windows desktop app that teaches Roblox scripting in **Luau** (plus C++ and Java) from zero programming knowledge.
English and Dutch are written by people; 84 more languages are machine-translated on the student's own computer.
It runs offline. Courses 0 and 1 are free; the full course is a one-time purchase unlocked with a license key.
For the current, honest feature status see [PROGRESS.md](PROGRESS.md).

> The repository is still called `RobloxDevAcademy` (the app was renamed from "Roblox Dev Academy" in 0.6.0).
> Lumora Academy is an independent project and is not affiliated with Roblox Corporation.

## For learners

Install with `Lumora-Academy-Setup.exe`. No Node.js or other tools are needed.
Your learning data is stored in `%APPDATA%\Lumora Academy\` (`data/academy.sqlite`, plus `backups/`).
Data from version 0.5 and older (`%APPDATA%\Roblox Dev Academy\`) is copied over automatically on first start.
Uninstalling keeps your data.

## For sellers: setting up the $9.99 full course

All settings live in [`shared/license.ts`](shared/license.ts):

- **Lumora Discord bot keys** (`LUMORA1-…`, for crypto/PayPal sales): Ed25519-signed by the bot and checked fully
  offline with the public key in `offlinePublicKey`. Only the bot has the private key.
- **Gumroad keys**: create a Gumroad product with "Generate a unique license key per sale", put its **product ID** in
  `gumroadProductId` and the store link in `buyUrl`. The app checks a key once online
  (`api.gumroad.com/v2/licenses/verify`), then works offline; it re-checks every 14 days when online and only locks
  again when Gumroad reports a refund/chargeback.
- Free part: `FREE_COURSES` (Luau courses 0 and 1) and the first 3 lessons of C++ and Java.

An Electron app can always be patched by a determined user; the license check keeps honest people honest.

## For developers

Requirements: Windows 10/11, Node.js 22+ (tested with 24), npm.

```bash
npm install
npm run dev        # Vite dev server + Electron with hot reload for the UI
npm test           # unit, database, curriculum (English + Dutch, real Luau), license and i18n tests
npm run build      # type-check, build renderer and main process
npm start          # run the production build
npm run test:e2e   # end-to-end acceptance test against the built app (needs npm run build)
npm run tour       # screenshot every page into tests/e2e/screenshots/tour (TOUR_LANG=nl for Dutch)
npm run dist       # build the Windows installer into release/
```

`RDA_USER_DATA=<folder>` runs the app with a separate data folder (used by the e2e tests).
`E2E_EXE=<path to exe>` runs the e2e tests against a packaged build.
`MODEL_DIR=<folder with Xenova/m2m100_418M> node tests/e2e/translator.mjs` checks the offline translator.

## Languages

- Interface texts are English keys: `t('Run code')`, with `{placeholders}`. Dutch lives in `src/i18n/nl/*.ts`;
  a test fails when a `t('…')` text has no Dutch entry or a placeholder differs.
- Lesson content: English in `src/curriculum/*.ts`, Dutch in `src/curriculum/nl/*.ts` (same ids, so progress carries over).
- Other languages: **M2M100 418M** (MIT licence, quantized ONNX, about 640 MB), downloaded on request from huggingface.co
  into the app's data folder and run in a separate utility process (`electron/translate-worker.ts`). Text is split into
  sentences; code, `{placeholders}` and URLs are swapped for tokens and restored afterwards (`shared/mt-segment.ts`);
  if a token goes missing the English sentence is kept. Every sentence is cached in the database, so it is translated
  once. Machine-translated screens show an "automatically translated" label.
- Optional: pre-translated interface packs can be added as `src/i18n/packs/<code>.json` (English → target); they are
  loaded first and the translator fills any gaps.

## Architecture

```text
electron/          main process: window, app:// protocol + CSP, validated IPC, legacy data migration
  db/              SQLite (sql.js) storage, migrations, repository (queries + award rules)
  services/        Luau runtime + analyzer, C++/Java runner, license check, translator (model download + cache)
  translate-worker.ts  utility process running the M2M100 model
  preload.ts       the only bridge to the renderer (allowlisted channels)
shared/            pure TypeScript used by both sides (and by the tests)
  i18n.ts, languages.ts, mt-segment.ts, license.ts, brand.ts (product name in one place)
  ipc.ts           channel list + Zod schemas
  evaluator.ts     exercise checking by behaviour (output, values, test harnesses, re-runs with other values)
  explain-error.ts / explain-native.ts  real diagnostics → five-part plain-language explanation
src/               renderer (React)
  i18n/            dictionaries, language switching, machine translation of content
  curriculum/      lesson CONTENT as data (English + nl/), practice, knowledge base, projects
  features/        one folder per page; learning/ holds the lesson engine, license/ the lock screen
tests/             Vitest suites; tests/e2e drives the real app over the Chrome DevTools Protocol
scripts/           esbuild config, CDP driver, icon renderer, Windows packaging
docs/              download page for GitHub Pages
.github/workflows/ free CI: build + test + publish installer (release.yml), download page (pages.yml)
```

### Adding a lesson

1. Add a `Lesson` to a course file in `src/curriculum/` and the same lesson (same ids) in `src/curriculum/nl/`.
2. Give every exercise `checks` that test behaviour, a `solution`, hints that don't reveal the answer, and a `starter` that fails.
3. Run `npm test`: the curriculum suite runs each solution and starter, in both languages, in real Luau.

### Packaging note

NSIS cannot handle paths longer than 260 characters, so `scripts/package-win.mjs` stages the shipped files in a short
temp folder. It also copies the translator's runtime packages and keeps only the Windows x64 ONNX binaries.

## Free publishing

The app runs on each student's PC, so there is no server to host:

1. Push to a **public** GitHub repository (branch `main`). Settings → Pages → Source: **GitHub Actions**.
2. Publish a version: `git tag v0.6.0` and `git push origin v0.6.0`. The workflow runs all tests, builds the installer on
   Windows and attaches `Lumora-Academy-Setup.exe` to a GitHub Release.
3. The download page always links to `releases/latest/download/Lumora-Academy-Setup.exe`.
