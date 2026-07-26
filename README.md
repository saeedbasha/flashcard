# Quiz Academy

A single-file quiz + flashcard study app for a Data Science / ML / AI bootcamp
cohort. No build step, no dependencies, no backend, no login. The whole app is
`index.html`; all content lives in `data.js`.

- **Home screen:** two cards, **Quiz** and **Flashcards**.
- **Quiz mode:** pick a topic (or Quick-Exam for 10 random mixed-topic
  questions) and start answering immediately. Multiple choice, one question at a
  time, with instant feedback and an explanation for every option.
- **Flashcard mode:** pick a topic, flip cards, mark "I knew it" / "review
  again"; unknown cards keep resurfacing until you know them.
- **Nothing is collected and nothing leaves the browser.** There is no name,
  email, or group prompt, and no score reporting to an instructor. Both modes
  keep a local history in that browser's local storage, viewable from the
  **Stats** button, and that is the only place results are stored. Clearing site
  data clears the history.

## What is in this repo

| File | Purpose |
|------|---------|
| `index.html` | The entire app: styles, markup shell, and all JS logic. |
| `data.js` | All content: `COURSE_DATA = { courseName, topics: [...] }`, stored pretty-printed (2-space indent) so changes are diffable and mergeable. Loaded via `<script src="data.js?v=N">`. |
| `toc.yml` | Controls which topics are visible to students (see "Hiding a topic"). |
| `topic-repo-map.md` | Maps each topic to the repo notebook its repo questions are grounded in. |
| `check-answer-balance.js` | Data check for the three answer-balance tells: length, position, and formatting bias. |
| `package.json` | `npm test` / `npm run check` wire up the data checks (no dependencies). |
| `.githooks/pre-commit` | Opt-in hook that runs the data check on commits touching `data.js`. |
| `.github/workflows/deploy-pages.yml` | Builds and deploys the site to GitHub Pages on every push to `main`. |
| `.github/workflows/quiz-data-check.yml` | CI that runs the data check on pull requests, on pushes to `main`, and on demand via `workflow_dispatch`. |

## Deploy it for students (GitHub Pages via Actions)

Deployment is handled by `.github/workflows/deploy-pages.yml`. There is no build
step: the repo checkout *is* the site, so the workflow just uploads it as a Pages
artifact and deploys.

One-time setup, in the repo's **Settings, then Pages**: under **Build and
deployment**, set **Source** to **GitHub Actions** (not "Deploy from a branch").
Equivalently, from the CLI:

```
gh api -X PUT repos/<owner>/<repo>/pages -f build_type=workflow
```

After that, every push to `main` redeploys automatically. You can also trigger a
deploy by hand from the **Actions** tab (the workflow has `workflow_dispatch`),
which is the easiest way to run the very first deploy without pushing a commit.

GitHub publishes it at `https://<your-username>.github.io/<repo-name>/`. That
link opens straight into the app: no slides, no navigation, no login, just the
quiz. Share that URL with your students.

Note: switching **Source** to **GitHub Actions** must happen *after* the workflow
file is on `main`. If you flip it first, Pages has no artifact to serve and the
live site goes blank until the first workflow run finishes.

## Updating course content

All topics, quiz questions, and flashcards live in `data.js`
(`COURSE_DATA.topics`), not in `index.html`. Each topic is
`{ id, name, quiz: [...], cards: [...] }`.

Current content shape (as of 2026-07-26):

- **34 topics, 1245 quiz questions, 831 flashcards.** Every topic serves its
  full historical question set rather than a fixed 12. Topics 1-21 carry 44-50
  questions each; topics 22-34 carry 18-21.
- Each topic's `quiz` array is ordered **curated questions first, then the
  restored legacy set**. The 408 curated questions carry a `difficulty` field
  (`"easy"` / `"medium"` / `"hard"`); the 837 restored ones do not. The app never
  reads `difficulty`, so it is documentation only, and the old "exactly 12 per
  topic, 8 easy / 3 medium / 1 hard" rule no longer applies.
- `topic-repo-map.md` records which repo and notebook each topic's repo
  questions are grounded in.
- **All three answer-balance checks pass.** No question can be guessed from the
  shape of its options rather than its content: see "Data checks" below for what
  each check covers and how the cleanup was done.

The repeatable, checked process for adding or expanding a topic is the
`add-quiz-topic` skill (`.claude/skills/add-quiz-topic/SKILL.md`). Read it
before writing new content; it covers sourcing, the exact schema and note
structure, grounding repo questions, and validation.

**Cache-buster:** every time you change `data.js`, bump `N` in
`<script src="data.js?v=N">` in `index.html`. Browsers cache the large static
file aggressively by URL, so without the bump a normal refresh keeps serving the
old content. (`toc.yml` is fetched no-store and needs no bump.)

## Hiding a topic from students

`toc.yml` lists every topic by id. Comment out a line (add a leading `#`) to hide
that topic from the Quiz picker, Flashcards picker, and Quick-Exam, without
deleting its content from `data.js`. Remove the `#` to show it again. No
cache-buster bump needed for this file; if `toc.yml` is missing or empty, the app
fails open and shows every topic.

## Data checks and development

There is no runtime test suite, but the content has automated data checks (plain
Node, no dependencies):

- `npm test` (or `npm run check`) runs `node --check data.js` then
  `check-answer-balance.js`. It fails on a syntax error or on any of the three
  tells below. **It currently passes.**
- Enable the pre-commit hook once per clone with
  `git config core.hooksPath .githooks`. It then runs the same check
  automatically on any commit that touches `data.js` (bypass in an emergency with
  `git commit --no-verify`).
- CI runs the same check on pull requests that touch `data.js`,
  `check-answer-balance.js`, or `package.json`, on every push to `main`, and on
  demand from the **Actions** tab.

### The three tells

Each one is a way to score above chance without reading the question, so each is
a bug in the content even when every answer is factually correct.

1. **Length bias.** The correct option is at least 1.3x the average distractor
   length. Guessing "the longest option" beats chance when this is common.
2. **Position bias.** One answer index accounts for 40 percent or more of a
   topic's questions.
3. **Formatting bias.** Markdown emphasis (bold, inline code, italics) singles
   the correct option out. Checked in **both** directions: emphasis only on the
   correct option, and emphasis on every distractor but absent from the correct
   one. Both let a reader pick the odd one out on appearance alone.

Current state: **0 flagged on all three.** "Pick the single longest option" scores
408/1245 (32.8 percent, against ~25 percent chance), down from about 62 percent.
The answer index spread is 25.9 / 25.4 / 24.6 / 23.9 percent.

**One deliberate exemption.** The length ratio is meaningless when the options are
single words: in one question the choices are `Mean`, `Mode`, `Median`, `Range`,
where the correct answer is 6 characters against an average of 4.3 and scores
1.38x. Nobody picks an answer by counting letters at that scale. The check skips
questions whose correct option is under 12 characters (`MIN_LENGTH_FOR_RATIO`)
and **prints exactly which question it exempted and why**, so the exemption is
visible rather than silent. It currently rescues that one question and nothing
else.

### How the length cleanup was done

Worth reading before writing new questions, because the same habits reintroduce
the bias.

The root cause was consistent: the correct option carried a full explanation
while its distractors carried one clause. The primary fix was therefore
**trimming the correct option, not padding the distractors**, since padding
invents filler and trades one tell ("longest is right") for another ("wordy and
hedged is wrong"). Every trim was checked against the question's note first, and
the detail removed from an option always already existed in the note, so nothing
was lost to the learner.

Rules that came out of it:

- **Match the distractors' shape.** Where the correct option justified itself
  against bare distractors, the justification *was* the giveaway. `Vector A and
  Vector B: they point in nearly the same direction` next to `Vector B and Vector
  C` becomes simply `Vector A and Vector B`, and the reasoning lives in the note.
- **Mirror pairs get identical treatment.** Where two options are the same
  sentence with one term swapped (Setting A/B, Panel A/B), trimming only the
  correct half makes it the odd one out by length. Trim both.
- **Lengthen a distractor only by appending at the end.** A note's "Wrong"
  bullets often quote a *fragment* of an option; inserting a word mid-string
  breaks the quotation. This orphaned 10 bullets before the rule was adopted.
- **Commands and formulas cannot be padded honestly.** Fix from the distractor
  side instead: give fake commands plausible long forms, real ones their genuine
  longer spellings (`git reset --hard` becomes `git reset --hard HEAD`), and
  formulas a short parenthetical gloss. If you gloss the distractors, gloss the
  correct option too, or you have just created a formatting tell in the other
  direction.
- **Never invent mechanics to pad a distractor.** Filler is harmless; a false
  statement about how something works is a content bug that no automated check
  here can catch.

The checks cannot see meaning. They compare lengths, indices, and markup, so a
green run is not evidence that an edited question still says something true.
Read the questions you change.

### Known outstanding issue: the gloss backlog

One tell is **not** yet gated. In 22 questions the correct option ends with a
parenthetical gloss and none of its distractors do. That is the same "odd one out
by appearance" pattern as formatting bias, in a style
`check-answer-balance.js` does not currently test for. These are pre-existing and
were left alone rather than folded into the length cleanup. Fixing them, and then
adding a trailing-parenthetical test as a fourth check, is a self-contained piece
of work.

### `data.js` is stored pretty-printed, keep it that way

`data.js` is written as `const COURSE_DATA = ` followed by
`JSON.stringify(data, null, 2)`, so it is about 20,700 lines rather than one. Any
script that rewrites the file must reproduce that exact form:

```js
fs.writeFileSync('data.js', 'const COURSE_DATA = ' + JSON.stringify(data, null, 2) + ';\n');
```

A bare `JSON.stringify(data)` collapses it back onto one line. It was stored that
way until 2026-07-26, and the cost was not cosmetic. Git is line-based, so a
one-line file makes *every* edit "line 1 changed": two branches editing unrelated
topics then conflict by definition, and the conflict cannot be resolved by
inspection. Measured on this repo, with edits to two different topics that do not
overlap at all:

| | one line | pretty-printed |
|---|---|---|
| Unrelated edits to different topics | conflict, 3 blocks | merges cleanly |
| Diff to read for a one-word fix | 4,447,188 bytes | 582 bytes |

Note that `git diff --stat` reports "1 insertion, 1 deletion" in *both* cases,
which is why the problem hid for so long: it looks fine until you try to read the
diff and get the whole old file followed by the whole new file.

The cost of the pretty form is about 240 KB on disk and roughly 2 percent once
gzipped (610 KB to 625 KB), which is what students actually download. In exchange,
content changes are reviewable as ordinary line diffs and `git blame` works on
individual questions.

To preview locally, serve the folder with a static server (e.g.
`python3 -m http.server 8000`) and open the printed URL, then click through both
the Quiz path (topic picker, quiz, results) and the Flashcards path. Both should
start immediately with no login prompt of any kind.
