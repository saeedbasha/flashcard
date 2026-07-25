# Quiz Academy (flashcards)

Static single-file quiz/flashcard study app for a Data Science/ML/AI bootcamp cohort. No build step, no backend, no login. Deployed to GitHub Pages by the `deploy-pages.yml` Actions workflow on every push to `main`.

## Architecture

- `index.html`: the entire app (styles, markup shell, and all JS logic) in one file.
- `data.js`: the content, `COURSE_DATA = { courseName, topics: [...] }`. Loaded via `<script src="data.js?v=N">` in `index.html`.
- `toc.yml`: controls which topics from `data.js` actually show up in the app, see "Controlling which topics students see" below.
- No framework, no bundler. Plain DOM rendering via template strings (the `el()` helper) and a `render()` dispatcher keyed on `state.screen`.

## Data schema (`data.js`)

Each topic: `{ id, name, quiz: [...], cards: [...] }`.

- `name` includes its own number prefix as text, e.g. `"14. Git & Version Control Workflows"`.
- Quiz item: `{ q, options: [4 or 5 strings], answer: <0-based index>, note, weblink, image? }`.
- Card: `{ q, note, explain?, weblink?, image? }`.
- `note` on quiz items follows a fixed structure: `**Correct:** ...` then a blank line, `**Wrong:**` with one bullet per wrong option explaining why, then `**Further Explanation:** ...`, then `🔗 **WebLink:** ...`. Rendered through `mdLite()`, a small hand-rolled markdown subset (bold, italic, inline/fenced code, bullet lists).
- `image` fields are legacy URLs from an old QuizAcademy export (`s3.eu-central-1.amazonaws.com/media.quizacademy.io/...`). After the 2026-07-25 full-set restore there are 271 of them (171 on quiz items, 100 on cards), spread across topics 2, 5, 6, 7, 8, 9, 10, 11, 13, 14, 20 and 21. That bucket is **still live** (spot-checked, HTTP 200), so these diagrams do render rather than silently disappearing. New topics should still not get an `image` field, there's no way to host new images for this project; the renderer degrades gracefully (`onerror="this.remove()"`) if one ever breaks.

## Adding a new topic

1. Source material lives in the mirrored course book at `/Users/saied/Desktop/websites/install book/neuefische.github.io/onions-interval-book/sessions/*.html` (a local HTTrack mirror of the real course site). Extract the `<article>` text before writing questions from it, see `.claude/skills/add-quiz-topic/SKILL.md`.
2. Assign the next sequential `id` and a `"N. Title"` name.
3. Match the schema and note structure above exactly. No `image` field on new content. No em dash or double hyphen in prose (git/SQL flags like `--global` or `--cached` are fine, that's syntax, not punctuation).
4. **Bump the cache-buster** in `index.html`'s `<script src="data.js?v=N">` tag every time `data.js` changes. Browsers aggressively cache a large same-named static file; without bumping `?v=`, students (and you) keep seeing a stale topic list after a normal refresh. This caused real confusion during development, don't skip it.
5. Validate before calling it done: `node --check data.js`, then parse `COURSE_DATA` and confirm every quiz item's `answer` index is in range and every item has exactly the expected fields, then actually load the app in a browser and click through the new topic (Quiz and/or Flashcards).

## Controlling which topics students see (`toc.yml`)

`toc.yml` lists every topic `id` from `data.js`, one per line (`- N  # name, for readability only`). Every id listed and not commented out appears in the Quiz topic picker, the Flashcards topic picker, and Quick-Exam's random question pool. To hide a topic from students without deleting its content from `data.js`, comment out its line by adding a leading `#`; uncomment to show it again. No cache-buster bump needed, `index.html` fetches `toc.yml` with `cache: 'no-store'` on every load.

This is a hand-rolled parser (`parseTocYml()` in `index.html`), not a real YAML library, since the format is just a flat commented list. If `toc.yml` is missing, unreadable, or ends up empty after parsing, the app fails open and shows every topic rather than breaking.

## Question set shape

As of 2026-07-25 every topic serves its **full historical question set**, not a fixed 12. Totals: **34 topics, 1245 quiz questions, 831 flashcards**. Topics 1-21 carry 44-50 questions each; topics 22-34 carry 18-21. The flashcard arrays were never trimmed at any point in this project's history and are unchanged.

Each `quiz` array is ordered **curated first, then restored legacy**:

- The **408 curated** questions come first and each carries a `difficulty` field (`"easy"`/`"medium"`/`"hard"`). These are the ones that received every later fix: option shuffling, length-bias edits, LaTeX delimiters, audit corrections.
- The **837 restored** questions follow and have **no** `difficulty` field. They were recovered from git history (the pre-trim `data.js`, plus the 15-question era for topics 22-34) and merged back by question text, keeping the curated version wherever both existed so no fix got reverted.
- `difficulty` is **vestigial**: `index.html` never reads it. Do not treat it as meaningful, and do not invent tiers for untagged questions. The old "exactly 12 per topic, 8 easy / 3 medium / 1 hard" rule is **retired**; do not re-impose it.

**Position bias is clean** and must stay that way: no answer index is over-represented in any topic (overall ~26/25/25/24 percent). Permuting a question's `options` array is safe because each `note`'s `**Wrong:**` bullets quote the option text verbatim rather than keying off position; just keep `answer` pointing at the same option text.

**Length bias is a known, deliberately visible failure.** `npm test` currently exits non-zero: 668 of 1245 questions have a correct option >= 1.3x the average distractor length, and "pick the longest" scores ~62 percent. The old length-bias pass only ever touched the 408 survivors, so the 837 restored questions never got it. This was left red rather than fixed by loosening `check-answer-balance.js`'s threshold, which would hide a real content problem. **Do not "fix" this by editing the threshold or the checker.** Fixing it properly means rewriting distractor text question by question. Because of this, commits touching `data.js` need `git commit --no-verify` until the content is cleaned up.

Historical note on two topics that needed a manual exclusion pass in the 15-question era: **Topic 2** ("Data Science & ML Fundamentals") had Git questions duplicating Topic 1, and **Topic 12** ("ML Productionization & Data Products") had confusion-matrix/precision/recall questions duplicating Topic 8. Restoring the full set brings those originals back, so both topics again contain some overlap with Topics 1 and 8 respectively. That is expected, not a regression to re-trim silently.

If adding new quiz questions, ground them in the course-book source (see the `add-quiz-topic` skill), tag them with `difficulty` only if you are extending the curated block, and run `node check-answer-balance.js <topic id>`. Note the per-topic position check only engages at >= 8 questions per topic.

## Score delivery: none

There is **no score delivery and no login**. The name/email/group gate, the `GOOGLE_FORM` config, and `submitScoreToGoogleForm()` were all removed on 2026-07-25, along with `groups.yml` and its parser. Quiz results and flashcard progress are written to that browser's `localStorage` only and are viewable via the in-app Stats screen. Nothing leaves the device.

If per-student reporting is ever wanted again, treat it as a fresh feature with a fresh decision about what is collected. Do not resurrect the old Google Form code path; the form ids in git history point at a real form.

## Testing

There is no runtime test suite, but two data checks are wired up via `package.json` (no dependencies, just Node):

- `npm run check` (or `npm test`) runs `node --check data.js` then `node check-answer-balance.js`. Run this after any `data.js` edit; it fails if the file has a syntax error, a length-bias flag (a correct option >= 1.3x the average distractor length), or a position-bias flag.
- An opt-in pre-commit hook lives in `.githooks/pre-commit`. Enable it once per clone with `git config core.hooksPath .githooks`; it then runs the same check automatically whenever a commit touches `data.js` (bypass in an emergency with `git commit --no-verify`).
- CI runs the same `npm test` on GitHub Actions (`.github/workflows/quiz-data-check.yml`) for every pull request that touches `data.js`, `check-answer-balance.js`, or `package.json`, so a bias regression turns the PR check red even if the local hook is not enabled.

Note that `npm test` currently exits non-zero by design, on the length-bias check only (see "Question set shape"). `node --check data.js` and the position-bias check both pass. When you change `data.js`, compare against that baseline rather than expecting green, and do not silence the checker to get green.

- A third workflow, `.github/workflows/deploy-pages.yml`, deploys the site to GitHub Pages on every push to `main` and can be run by hand from the Actions tab (`workflow_dispatch`). This repo's Pages **Source** must be set to **GitHub Actions**, not "Deploy from a branch", or the deploy step fails with no site to serve.

Beyond the data checks, verify the app manually: run a local static server (`python3 -m http.server <port>` from this folder) and click through both the Quiz path (topic picker, quiz, results) and the Flashcards path (topic picker, cards) in an actual browser. Both should start immediately: there is no gate to validate any more.

## Style

No em dash or double hyphen anywhere in prose (chat replies, code comments, commit messages, generated quiz/flashcard content). Real code syntax that happens to contain two hyphens (CLI flags, SQL comments) is fine, that's not prose punctuation.

## Working with background agents on this project

Background subagents on this project have, in the past, kept self-resuming and taking increasingly broad unrequested action (writing scratch files, then merging content into `data.js` directly, then editing `index.html`, then proposing a `git init` and commit) across several completion notifications for what was meant to be a single, narrowly scoped task. Prefer letting one agent finish its assigned scope and stop; verify its output yourself (see "Adding a new topic" above) before merging or building on it, rather than trusting a subagent's self-report or letting it keep going unsupervised.
