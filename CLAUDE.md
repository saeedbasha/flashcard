# Quiz Academy (flashcards)

Static single-file quiz/flashcard study app for a Data Science/ML/AI bootcamp cohort (neue fische x SPICED). No build step, no backend, deployed via GitHub Pages.

## Architecture

- `index.html`: the entire app (styles, markup shell, and all JS logic) in one file.
- `data.js`: the content, `COURSE_DATA = { courseName, topics: [...] }`. Loaded via `<script src="data.js?v=N">` in `index.html`.
- `assets/`: logos only.
- No framework, no bundler. Plain DOM rendering via template strings (the `el()` helper) and a `render()` dispatcher keyed on `state.screen`.

## Data schema (`data.js`)

Each topic: `{ id, name, quiz: [...], cards: [...] }`.

- `name` includes its own number prefix as text, e.g. `"14. Git & Version Control Workflows"`.
- Quiz item: `{ q, options: [4 or 5 strings], answer: <0-based index>, note, weblink, image? }`.
- Card: `{ q, note, explain?, weblink?, image? }`.
- `note` on quiz items follows a fixed structure: `**Correct:** ...` then a blank line, `**Wrong:**` with one bullet per wrong option explaining why, then `**Further Explanation:** ...`, then `🔗 **WebLink:** ...`. Rendered through `mdLite()`, a small hand-rolled markdown subset (bold, italic, inline/fenced code, bullet lists).
- `image` fields are legacy URLs from an old QuizAcademy export (`s3.eu-central-1.amazonaws.com/media.quizacademy.io/...`), present only on topics 1-12. New topics should not get an `image` field, there's no way to host new images for this project; the renderer already degrades gracefully (`onerror="this.remove()"`) if one is present but broken.

## Adding a new topic

1. Source material lives in the mirrored course book at `/Users/saied/Desktop/websites/install book/neuefische.github.io/onions-interval-book/sessions/*.html` (a local HTTrack mirror of the real course site). Extract the `<article>` text before writing questions from it, see `.claude/skills/add-quiz-topic/SKILL.md`.
2. Assign the next sequential `id` and a `"N. Title"` name.
3. Match the schema and note structure above exactly. No `image` field on new content. No em dash or double hyphen in prose (git/SQL flags like `--global` or `--cached` are fine, that's syntax, not punctuation).
4. **Bump the cache-buster** in `index.html`'s `<script src="data.js?v=N">` tag every time `data.js` changes. Browsers aggressively cache a large same-named static file; without bumping `?v=`, students (and you) keep seeing a stale topic list after a normal refresh. This caused real confusion during development, don't skip it.
5. Validate before calling it done: `node --check data.js`, then parse `COURSE_DATA` and confirm every quiz item's `answer` index is in range and every item has exactly the expected fields, then actually load the app in a browser and click through the new topic (Quiz and/or Flashcards).

## Score delivery (Google Form)

Quiz results (name, email, topic, score, total) are meant to be sent to a Google Form via a silent `fetch(..., {mode:'no-cors'})` POST, see `GOOGLE_FORM` and `submitScoreToGoogleForm()` near the top of the `<script>` block in `index.html`. As of the last working session this is still unconfigured (`GOOGLE_FORM.actionUrl` is empty), so quiz scores are not reaching the instructor yet. See `README.md`'s "Score delivery setup" section for the exact steps to finish wiring it (create the Form's 5 short-answer fields, get the pre-filled link, extract the `entry.NNNNNN` ids). Flashcards are never sent anywhere, they only save to that browser's `localStorage`, viewable via the in-app Stats screen.

## Testing

No test suite. Verify manually: run a local static server (`python3 -m http.server <port>` from this folder) and click through both the Quiz path (topic picker, name/email gate, quiz, results) and the Flashcards path (topic picker, cards, no gate) in an actual browser. Gate validation should reject an empty name and a malformed email.

## Style

No em dash or double hyphen anywhere in prose (chat replies, code comments, commit messages, generated quiz/flashcard content). Real code syntax that happens to contain two hyphens (CLI flags, SQL comments) is fine, that's not prose punctuation.

## Working with background agents on this project

Background subagents on this project have, in the past, kept self-resuming and taking increasingly broad unrequested action (writing scratch files, then merging content into `data.js` directly, then editing `index.html`, then proposing a `git init` and commit) across several completion notifications for what was meant to be a single, narrowly scoped task. Prefer letting one agent finish its assigned scope and stop; verify its output yourself (see "Adding a new topic" above) before merging or building on it, rather than trusting a subagent's self-report or letting it keep going unsupervised.
