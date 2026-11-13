# Roblox Dev Academy

A Windows desktop app that teaches Roblox scripting in **Luau**, in **Dutch**, from zero programming knowledge.
It runs fully offline. For the current, honest feature status see [PROGRESS.md](PROGRESS.md).

## For learners

Install with `release/Roblox-Dev-Academy-Setup.exe`. No Node.js or other tools are needed.
Your learning data is stored in `%APPDATA%\Roblox Dev Academy\` (`data/academy.sqlite`, plus `backups/`).
Uninstalling keeps your data.

## For developers

Requirements: Windows 10/11, Node.js 22+ (tested with 24), npm.

```bash
npm install
npm run dev        # Vite dev server + Electron with hot reload for the UI
npm test           # unit, database and curriculum tests (real Luau runtime)
npm run build      # type-check, build renderer and main process
npm start          # run the production build
npm run test:e2e   # end-to-end acceptance test against the built app (needs npm run build)
npm run tour       # screenshot every page into tests/e2e/screenshots/tour
npm run dist       # build the Windows installer into release/
```

`RDA_USER_DATA=<folder>` runs the app with a separate data folder (used by the e2e tests).
`E2E_EXE=<path to exe>` runs the acceptance test against a packaged build.

## Architecture

```text
electron/          main process: window, app:// protocol + CSP, validated IPC, study-time tracking
  db/              SQLite (sql.js) storage, migrations, repository (queries + award rules)
  services/        Luau runtime + analyzer service, window state
  preload.ts       the only bridge to the renderer (allowlisted channels)
shared/            pure TypeScript used by both sides (and by the tests)
  ipc.ts           channel list + Zod schemas
  evaluator.ts     exercise checking by behaviour (output, values, test harnesses) + syntax-aware token checks
  explain-error.ts real diagnostics → five-part Dutch explanation
  luau-lexer.ts    tokenizer (ignores strings/comments for checks)
  mastery.ts, review.ts, xp.ts, study-tracker.ts, format.ts, achievements.ts
src/               renderer (React)
  curriculum/      lesson CONTENT as data: courses, practice, knowledge base, projects
  features/        one folder per page; learning/ holds the lesson engine
  editor/          Monaco setup (Luau language, themes, analyzer autocomplete)
  styles/          tokens.css (design tokens, both themes), components.css, pages.css
tests/             Vitest suites; tests/e2e drives the real app over the Chrome DevTools Protocol
scripts/           esbuild config, CDP driver, icon renderer, Windows packaging
studio-plugin/     Roblox Studio companion plugin (Luau), installed from the Academy
docs/              download page for GitHub Pages
.github/workflows/ free CI: build + test + publish installer (release.yml), download page (pages.yml)
```

### Key decisions

- **Luau runtime**: [`@luau-rs/luau`](https://github.com/luau-rs/luau), which is official Luau v739 compiled to WebAssembly. It provides both the runtime (sandboxed worker with memory/interrupt limits) and the analyzer (diagnostics, lint, autocomplete), with no native binaries.
- **SQLite via sql.js** instead of a native module: no rebuild against Electron's ABI, so Windows installs are reliable. Durability comes from atomic tmp+rename writes, debounced flushes, flush on quit, and backups.
- **Content is data**: lessons live in `src/curriculum/*.ts`, separate from app logic, and the database references them only by stable ids. `tests/curriculum.test.ts` proves every exercise is solvable and that every starter fails.
- **Honesty rules** are enforced in code: Roblox-engine code is never "run" outside Studio, Studio steps are labelled self-confirmed, statistics show only real data, and unknown errors are shown verbatim.

### Adding a lesson

1. Add a `Lesson` object to a course file in `src/curriculum/` (ids must be unique; concept ids come from `concepts.ts`).
2. Give every exercise `checks` that test behaviour, a `solution`, hints that don't reveal the answer, and a `starter` that fails.
3. Run `npm test`: the curriculum suite runs each solution and starter in real Luau.

### Packaging note

NSIS cannot handle paths longer than 260 characters, so `scripts/package-win.mjs` stages the shipped files
(`dist`, `dist-electron`, two runtime packages) in a short temp folder and builds the installer there.

## Gratis publiceren (24/7 online)

The app runs offline on each student's PC, so there is no server to host. "Online 24/7" means a free download:

1. Create a **public** repository on GitHub and push this project to it (branch `main`).
2. Repository → Settings → Pages → Source: **GitHub Actions**. The download page in `docs/` goes live at `https://<owner>.github.io/<repo>/`.
3. Publish a version: `git tag v0.3.0` and `git push origin v0.3.0`. The workflow runs all tests, builds the installer on Windows and attaches `Roblox-Dev-Academy-Setup.exe` to a GitHub Release.
4. The download button on the page always points to `releases/latest/download/Roblox-Dev-Academy-Setup.exe`.

Both GitHub Pages and Actions are free for public repositories.
