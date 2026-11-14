# PROGRESS — Lumora Academy (formerly Roblox Dev Academy)

Last updated: 2026-11-14 · Version 0.6.1

This file is the honest status of the project. "Done" means built **and** tested; everything else is labelled.

## Summary

| Area | Status |
|---|---|
| Core app (lessons, editor, real Luau/C++/Java execution, progress, statistics) | **Done** |
| Content | **Done** for courses 0–5 (Luau foundation), C++ and Java basics; courses 6–12 not written |
| Languages | **Done**: English + Dutch by people; 84 languages machine-translated offline (quality varies, labelled) |
| Selling | **Done**: free trial (courses 0–1) + full course via license key (Lumora bot keys offline, Gumroad online once; product `lumoracademy` connected in 0.6.1) |
| Roblox Studio plugin | **Removed** in 0.6.0 (Studio steps are self-confirmed checklists again) |
| AI (Claude) option | **Removed** in 0.6.0 (the free built-in explainer video stays) |
| Production | Installer works and is tested; not code-signed (SmartScreen warning) |

### Ready for students now

**52 lessons**: 42 in Roblox Luau (courses 0–5) plus 5 C++ and 5 Java lessons, about 6–8 hours of lesson time
plus 27 practice exercises, 6 challenges, a 21-entry knowledge base and 1 of 10 projects. All exercises are
checked automatically in the real Luau runtime (and with g++/Java when installed).

| Course | Lessons | Free? |
|---|---|---|
| 0 — Before you code | 10 | Free |
| 1 — Luau fundamentals | 9 | Free |
| 2 — Conditions and logic | 6 | Full course |
| 3 — Loops | 6 | Full course |
| 4 — Functions | 5 | Full course |
| 5 — Tables | 6 | Full course |
| C++: the basics / Java: the basics | 5 + 5 | First 3 free each |
| 6–12 (engine, events, client/server, UI, data, advanced, games) | — | Planned topics shown as "in development" |

## What changed in 0.6.0

- **Renamed to Lumora Academy** (name in one place: `shared/brand.ts`). Data from `%APPDATA%\Roblox Dev Academy` is
  copied (not moved) into the new folder on first start, so progress is kept.
- **English is the base language.** All lessons, practice, knowledge base, projects, error explanations and the
  interface were rewritten in English. The original Dutch is kept as a human translation (same lesson ids).
- **86 languages.** Language picker in onboarding and Settings (default: the Windows language; existing 0.5 users
  keep Dutch). For the 84 machine languages the app uses M2M100 418M (MIT licence, free, ~640 MB, downloaded once from
  huggingface.co on request) in a separate utility process: nothing typed by the student leaves the computer. Code,
  placeholders and expected output are never translated; lost placeholders fall back to English (with a retry using
  number tokens). Every sentence is cached in the database (migration 5). Screens show an "automatically translated"
  label. The video-explanation voice uses a Windows voice for the chosen language when one is installed.
- **Free trial + $9.99 full course.** Courses 0–1 and the first 3 C++/Java lessons are free; other lessons show a lock
  screen with a buy button and key entry. Keys: `LUMORA1-…` keys from the Lumora Discord bot are Ed25519-signed and
  verified offline with the bot's public key; Gumroad keys are verified once online (license table, migration 5) and
  re-checked every 14 days when online (only a refund/chargeback locks again; being offline never does).
- **Removed**: the Roblox Studio plugin and local bridge, the Claude API option and `@anthropic-ai/sdk`. The "AI Tutor"
  page is now honestly called "Code Explainer" (offline static analysis). The lesson button is "Video explanation".

## What changed in 0.5.0

- **"Uitleg door AI Mentor" on every lesson**: an in-app animated explainer video (16:9) with live-typed code, highlighted lines, captions, real program output (the code is really run, not counted as a student run), play/pause, scene timeline, speed and keyboard control. Voice-over uses a Dutch Windows voice when installed (otherwise captions only, with instructions).
- Without an API key the script is built from the lesson itself (offline, labelled "Ingebouwde uitleg"). With a Claude API key (Instellingen → AI Tutor) **Claude Opus 5.5** writes a personal script, labelled "Gemaakt door AI (Claude)". Only lesson content is sent; the key is stored encrypted with Windows (safeStorage) and never logged; AI output is validated against a strict schema (one retry, then the built-in version); results are cached per lesson (database migration 4). Server-side refusal fallback (`fallbacks: "default"`) is enabled.
- **All common errors explained in easy Dutch**: a corpus of 38 typical beginner mistakes runs through the real Luau runtime and analyzer in the tests; none may fall back to "unknown". New: missing comma/brace in tables, extra `end`/`else`/`)`, `s.upper()` vs `s:upper()`, wrong or missing arguments, comparing different types, calling a non-function, endless recursion, `nil` as table key, two statements on one line, own `error()` messages. Friendlier fallback text for C++/Java too.
- **More attractive UI**: gradient accents, glow and depth on cards and buttons, a hero header per lesson, accent course numbers, success glow animation.

## What changed in 0.4.0

- **C++ and Java tracks** (5 lessons each: output, variables and types, if/else, loops, functions/methods), next to Roblox Luau. Each track unlocks on its own, so students can start C++ or Java right away.
- Code runs with the official free toolchains: the JDK's source launcher for Java, g++ (MinGW-w64/MSYS2) for C++. The app detects them (PATH, JAVA_HOME and common install folders) and shows free install steps in Dutch if missing. Runs use a temporary folder, timeouts, an output limit and a minimal environment. Unlike Luau this is native code (not a WASM sandbox); see limitations.
- Exercises are checked like Luau: real output plus re-runs with other input values. Dutch explanations for common g++/javac/JVM errors (missing semicolon or brace, unknown name, std::cout without include, type mismatch, division by zero, out-of-bounds, null).
- Code Playground: `.cpp` and `.java` files run with their toolchain; C++ and Java examples added. Monaco syntax highlighting for both.
- **Typing sounds**, synthesized live (no audio files): Zacht, Mechanisch, Typemachine (with bell on Enter) and Bubbel, slightly randomized per key, with volume control. Short success/"not yet" sounds on exercises. All configurable (Instellingen → Geluid).
- **Backgrounds**: Aurora, Raster, Stippen, Avond, Oceaan, or your own image (PNG/JPG/WEBP/GIF up to 15 MB, copied into the app folder and served via `app://`, so the CSP stays strict), with a dim slider for readability.
- CI now fails if Java or g++ is missing on the build server, so all C++/Java content is compiled and checked on every release.

## What changed in 0.3.0 — Roblox Studio integration (removed again in 0.6.0)

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

## Tests executed (2026-11-14, v0.6.0)

| Suite | Result |
|---|---|
| `npm test` (Vitest, 9 files) | **434 passed**, 29 skipped (C++/Java content without local g++/JDK; CI runs them) |
| ↳ Curriculum in real Luau, **English and Dutch**: every solution passes, every starter fails, predicted output matches | all passed |
| ↳ License: valid LUMORA1 key, tampered key, key from another signer, unknown tier, no online re-check for offline keys; Gumroad accept / refund / not configured | all passed |
| ↳ i18n: every `t()` text has Dutch, placeholders match, segmenting keeps code and restores tokens | all passed |
| ↳ Database: migrations 1–5, translation cache, license storage | all passed |
| `tests/e2e/acceptance.mjs` on the **packaged build** (onboarding in English, lessons 1–2, persistence, lock screen, forged key refused, switch to Dutch) | **42 / 42 checks passed** |
| `tests/e2e/translator.mjs` on the **packaged build** (M2M100 in the utility process, Spanish UI text + lesson, code kept, cache) | **7 / 7 checks passed** |
| `tests/e2e/tour.mjs` (every page in English) | no page crashed |
| `tsc --noEmit` | clean |

Not executed: the full 640 MB model download from inside the app (the six download URLs were checked; the test used a
local copy of the same files), a purchase on Gumroad (no product ID yet), the NSIS installer UI itself, and the
GitHub workflows.

## Known limitations

- **Machine translation quality** is decent for everyday sentences and weaker for technical words (it is labelled).
  The first time a lesson opens in a new language it takes a while (~1–2 s per sentence on an average CPU), then it is
  cached. Without the model the 84 machine languages show English text with a notice.
- **Gumroad**: `gumroadProductId` and `buyUrl` in `shared/license.ts` must be filled in before Gumroad keys work.
  Lumora bot keys already work offline. A revocation list for bot keys is not implemented yet.
- **C++/Java need a local toolchain** (free: Temurin JDK, MSYS2 g++); this code runs natively without a sandbox.
- **Curriculum**: courses 6–12 and projects 2–10 are not written yet.
- **Formatter**: re-indentation only. **Playground runtime**: plain Luau (`task.wait` returns immediately, labelled).
- **Code signing** not configured: Windows SmartScreen warns on first install ("More info → Run anyway").
- Installer grew from 137 MB to 166 MB (ONNX runtime for the translator); the model itself is not in the installer.

## Remaining tasks (prioritised)

1. In Gumroad, turn on "Generate a unique license key per sale" for the product, then test one real purchase.
2. Optional: revocation list for LUMORA1 keys (fetched from GitHub Pages).
3. Optional: pre-translated interface packs for the most used languages, so the first start in those is instant.
4. Course 6 (Roblox engine) and Course 7 (events), plus projects 2–3.
5. Code signing certificate; accessibility audit.
