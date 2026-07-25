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
| `data.js` | All content: `COURSE_DATA = { courseName, topics: [...] }`. Loaded via `<script src="data.js?v=N">`. |
| `toc.yml` | Controls which topics are visible to students (see "Hiding a topic"). |
| `topic-repo-map.md` | Maps each topic to the repo notebook its repo questions are grounded in. |
| `check-answer-balance.js` | Data check for answer length bias and position bias. |
| `package.json` | `npm test` / `npm run check` wire up the data checks (no dependencies). |
| `.githooks/pre-commit` | Opt-in hook that runs the data check on commits touching `data.js`. |
| `.github/workflows/deploy-pages.yml` | Builds and deploys the site to GitHub Pages on every push to `main`. |
| `.github/workflows/quiz-data-check.yml` | CI that runs the data check on pull requests. |

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

Current content shape (as of 2026-07-25):

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
- **Position bias is balanced**: no answer index is over-represented in any
  topic (overall spread is roughly 26 / 25 / 25 / 24 percent).
- **Length bias is a known outstanding issue** on the restored legacy questions,
  see "Data checks" below.

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
  `check-answer-balance.js`. It fails on a syntax error, a length-bias flag (a
  correct option at least 1.3x the average distractor length), or a position-bias
  flag.
- Enable the pre-commit hook once per clone with
  `git config core.hooksPath .githooks`. It then runs the same check
  automatically on any commit that touches `data.js` (bypass in an emergency with
  `git commit --no-verify`).
- CI runs the same check on pull requests that touch `data.js`,
  `check-answer-balance.js`, or `package.json`.

### Known failure: length bias on restored questions

`npm test` currently **fails** on the length-bias check: 668 of 1245 questions
have a correct option at least 1.3x the average distractor length, and "pick the
single longest option" would score about 62 percent (chance is ~25 percent).

This is inherited, not new. The length-bias pass that cleaned up the old
12-question set only ever touched the 408 questions that survived the trim; the
837 questions restored from history never got it. Fixing it means rewriting
distractor text question by question, which is content work, so it is left
visible as a failing check rather than papered over by loosening the threshold.
Position bias, by contrast, was fixable mechanically (permuting each question's
options) and is clean.

Three ways forward, whenever it is worth the time:

1. Accept it and leave the check red as a standing to-do.
2. Fix distractors incrementally, topic by topic, until the check goes green.
3. Restore the full set for only some topics and keep the curated 12 elsewhere.

To preview locally, serve the folder with a static server (e.g.
`python3 -m http.server 8000`) and open the printed URL, then click through both
the Quiz path (topic picker, quiz, results) and the Flashcards path. Both should
start immediately with no login prompt of any kind.
