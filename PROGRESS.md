# PROGRESS — Roblox Dev Academy

Last updated: 2026-11-14 · Version 0.3.0

This file is the honest status of the project. "Done" means built **and** tested; everything else is labelled.

## Summary

| Phase | Status |
|---|---|
| 1 — Functional foundation | **Done** |
| 2 — Complete beginner experience | **Done** (Courses 0 and 1) |
| 3 — Roblox Studio integration | **Done** (plugin + secure local bridge + verification + safe sync); not yet tried inside a real Roblox Studio, see limitations |
| 4 — Advanced learning | **Partial**: Courses 2–5 (all of the plain-Luau foundation) written; mastery + review scheduling done; courses 6–12 not written |
| 5 — AI and advanced analytics | Partial: offline "explain my code" and the full statistics page; no AI provider |
| 6 — Production quality | Partial: hardened Windows installer, backups and recovery done; courses 6–12, accessibility audit and code signing not done |

### Ready for students now

A student can install the app and learn from zero up to and including **functions and tables**:
**42 lessons in 6 courses**, about 6–8 hours of lesson time plus practice. That covers everything in Luau
that does not need Roblox Studio. All exercises are checked automatically in the real Luau runtime.

| Course | Lessons | Exercises | Quiz / predict | Status |
|---|---|---|---|---|
| 0 — Voordat je codeert | 10 | 10 | 14 | Done |
| 1 — Luau-fundamenten | 9 | 16 | 5 | Done |
| 2 — Voorwaarden en logica | 6 | 10 | 5 | Done (v0.2) |
| 3 — Lussen | 6 | 10 | 3 | Done (v0.2) |
| 4 — Functies | 5 | 8 | 4 | Done (v0.2) |
| 5 — Tabellen | 6 | 10 | 2 | Done (v0.2) |
| 6–12 (engine, events, client/server, UI, data, advanced, games) | — | — | — | Planned topics shown as "in ontwikkeling" |

Plus: 27 practice exercises and 6 challenges, a 21-entry knowledge base and 1 of 10 projects.

## What changed in 0.3.0 — Roblox Studio integration

- **Studio companion plugin** (`studio-plugin/RobloxDevAcademy.lua`), installed with one click from the Academy into `%LOCALAPPDATA%RobloxPlugins`. It shows the opened exercise with steps; on the student's click it creates an **empty** practice script (comments only, never the answer, never overwriting), reads facts from the place (instances, allowlisted properties, script sources) and sends them to the Academy, offers script updates (apply/decline), and forwards Output errors during Play. Every change goes through ChangeHistoryService (Ctrl+Z).
- **Secure local bridge** (`electron/services/studio-bridge.ts`): 127.0.0.1:34873 only; Host check (DNS rebinding) and rejection of browser requests (Origin); pairing only after clicking "Koppelen" (6-digit code, 2 minutes, 5 attempts); 256-bit session token (stored hashed, survives restarts, revoked by "Ontkoppelen"); fixed route allowlist, Zod validation, 256 KB limit, rate limits; no code execution, no file access.
- **Verified Studio exercises** (first script, colour-changing part, countdown): instance/class/property checks + the real Luau analyzer + required constructs. A verified Studio step in a lesson or project completes itself ("Geverifieerd in Studio"); without pairing, the self-confirmation fallback remains.
- **Output help**: errors/warnings from Studio's Output during Play are explained in Dutch.
- **Safe script sync with conflict protection**: Studio → Academy creates or updates a Playground file; Academy → Studio is offered to the plugin, which refuses when Studio changed since the last sync. Changes on both sides create a conflict with a **side-by-side comparison**; the student chooses, and the other version stays in the revision history. (Database migration 3.)
- Studio connection states: Verbonden, Niet verbonden, Wacht op koppelcode, Plugin niet gevonden, Studio niet gestart (process detection), Fout.
- **Free 24/7 distribution prepared**: GitHub Actions workflow that tests, builds and publishes the installer as a GitHub Release on every version tag, plus a download page (`docs/`) for GitHub Pages. Fixed installer name `Roblox-Dev-Academy-Setup.exe`, so the download link always points to the newest version.

## What changed in 0.2.0

- **Courses 2–5 written** (23 new lessons, 38 exercises, each with a project at the end: shop check, round countdown, damage calculation, inventory system).
- **New check: testing with other values (`variants`).** The evaluator re-runs the student's program with a different input line (for example `local coins = 50` instead of `120`) and checks the output again, so a hard-coded `print("Kopen!")` without an `if` is rejected with a clear message. Functions are tested with small harnesses (up to 11 cases for the inventory project).
- The if-statement and for-loop visualizers now appear inside lessons.
- 19 new practice exercises and 3 new challenges for conditions, loops, functions and tables; 2 new achievements (Function Builder, Table Master).
- New Dutch explanation for "Malformed number" (for example `2coins` or a missing newline), found during testing.
- Code is shown **without ligatures** (beginners see `<=`, not `≤`), and success messages render their code formatting.
- **Electron fuses** enabled in the installer: no `ELECTRON_RUN_AS_NODE`, no `NODE_OPTIONS`, no `--inspect`, ASAR integrity validation, app only loads from its ASAR archive, no extra `file://` privileges.

## Completed functionality (built and tested)

**Application**
- Electron 45 + React 19 + TypeScript 6 + Vite 8, native Windows title-bar controls, remembered window size/position, single instance.
- Design system: dark + light themes, 4 accent colours, interface scaling, reduced motion, focus rings, toasts, skeletons, short transitions.
- 12 sidebar sections; every page has real functionality or an explicit "in ontwikkeling" label; no dead buttons.
- Onboarding: the five screens from the brief; lesson 1 starts immediately.

**Learning**
- Lesson engine: explanation, annotated code, runnable code, quiz, predict-the-output (verified by running), guided / independent / fix-the-bug exercises, variable / condition / loop visualizers, Studio checklists, summary. Sequential unlocking; state saved continuously and restored after interruption.
- Evaluator: real execution, exact output comparison, value checks, test harnesses, **re-runs with other input values**, token checks that ignore strings and comments. Hints step by step; the solution only after two failed attempts and a confirmation (then the attempt no longer counts as independent).
- Practice with adaptive ordering (weakest concept first), review mode for due concepts, challenges without hints.
- Knowledge base (21 Luau/Roblox API entries with official docs links), searchable offline; interactive event and client/server simulations (labelled as simulations).
- Project 1 (colour-changing part): static code check + Studio steps.

**Code**
- Monaco editor with Luau highlighting, brackets, auto-indent, multi-cursor, find/replace, folding, Ctrl+Enter.
- Real Luau autocomplete and diagnostics from the official Luau analyzer (v739, WASM).
- Real Luau execution (v739, WASM) in a worker thread: fresh sandbox per run, 32 MB memory, instruction budget, 4 s timeout, output limits.
- Roblox-engine code is detected and clearly marked "Studio only"; it is never shown as having run.
- Playground: files, tabs, run, save with version history and restore, re-indent formatting, reset, Output / Problems / Versions panels, crash-safe draft recovery.
- Dutch error assistant (Wat / Waarom / Waar / Hoe / Meer) based on real messages; unknown messages shown verbatim and labelled.

**Progress and data**
- SQLite (sql.js), migrations, indexes, transactions, atomic writes; daily backups (15 kept), manual backup/restore, JSON export, scoped reset, profile deletion (each preceded by a backup); corrupt-file recovery that never deletes the damaged file.
- Tracking of lessons, attempts (correctness, hints, independence, error category), quizzes, active study time (idle cutoff), sessions, XP, achievements, files and revisions.
- Mastery model (not based on time), weak-concept suggestions, spaced review scheduling, XP with database-enforced one-time awards, 18 achievements (11 earnable now), statistics with only real data.

**Security**
- `contextIsolation`, `sandbox`, no `nodeIntegration`; allowlisted preload; Zod validation of every IPC argument plus sender check; `app://` protocol with strict CSP and path-traversal guard; navigation, popups, webviews and permission requests blocked; external links allowlisted; student code in a WASM sandbox; Electron fuses in the installer.

**Distribution**
- `npm run dist` → `release/Roblox Dev Academy Setup 0.2.0.exe` (NSIS, per user, choose the install folder, desktop shortcut; uninstalling keeps learning data).

## Tests executed (2026-11-14, v0.3.0)

| Suite | Result |
|---|---|
| `npm test` (Vitest, 5 files) | **213 / 213 passed** |
| ↳ Curriculum validation in real Luau (solutions pass, starters fail, predicted output matches) | all passed |
| ↳ Studio: plugin compiles as Luau and only uses 127.0.0.1; bridge refuses pairing without consent, wrong codes (5×), missing/forged tokens, browser Origin, wrong Host, unknown operations, invalid/oversized payloads, floods; token survives restart, unpair revokes; exercise/check/push protocol; fact verification | all passed |
| ↳ Database incl. Studio sync: create, update, conflict without overwriting, resolution keeping both versions | all passed |
| `tests/e2e/acceptance.mjs` on the **packaged installer build** | **35 / 35 checks passed** |
| `tests/e2e/studio-bridge.mjs` on the **packaged installer build** (simulated plugin, exact protocol) | **19 / 19 checks passed** |
| `tsc --noEmit` | Clean |

Not executed: the plugin inside a real Roblox Studio (Studio is not installed/running on the build machine), the NSIS installer itself, and the GitHub workflows (they run once the project is pushed to GitHub).

## Known limitations

- **Curriculum**: Courses 6–12 (Roblox engine, events, client/server, UI, DataStores, advanced, full games) and projects 2–10 are not written yet. They need Roblox Studio, and therefore the Studio integration below, to be checked properly.
- **Roblox Studio plugin not yet tried in real Studio.** The protocol, security and verification are tested end to end against the real app with a simulated plugin, and the plugin compiles as Luau; its Studio-side behaviour (UI, HttpService localhost permission prompt, ScriptEditorService calls) still needs a manual check in Studio. Behaviour during Play (for example "the part turns blue") cannot be observed and stays self-confirmed.
- **AI tutor**: not implemented; the page offers an offline static code explanation.
- **Formatter**: re-indentation only (StyLua/Selene not bundled).
- **Playground runtime**: plain Luau. `task.wait` returns immediately (labelled); `task.spawn/delay/defer`, `os` and `io` are unavailable.
- **E2E typing speed**: synthetic key events faster than ~35 ms per key were partly dropped by Monaco in an empty editor; 90 ms per key works. Not observed with real typing.
- **Code signing** not configured: Windows SmartScreen will warn on first install ("Meer info → Toch uitvoeren").
- Main renderer chunk is 4.3 MB (mostly Monaco), loaded from local disk.

## Remaining tasks (prioritised)

1. Try the plugin in real Roblox Studio (install from the Studio page → pair → open "Kleurveranderend onderdeel" → Maak oefenscript → Controleer mijn werk) and fix anything Studio-specific.
2. Publish: push to a GitHub repository, enable Pages, tag `v0.3.0` (see README "Gratis publiceren").
3. Course 6 (Roblox engine) and Course 7 (events) with Studio-verified exercises, plus projects 2–3.
4. Courses 8–10 (client/server, UI, data) and projects 4–7.
5. Optional AI tutor; code signing certificate; accessibility audit.

## Next development step

Run the manual Studio check (task 1), then write **Course 6 — De Roblox-engine** using the now-available verified Studio exercises.
