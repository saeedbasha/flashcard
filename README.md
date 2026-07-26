# Quiz Academy

A quiz and flashcard study app for a Data Science / ML / AI bootcamp cohort.
No build step, no dependencies, no backend, no login. The whole app is
`index.html`, and all content lives in `data.js`.

**Live:** https://saeedbasha.github.io/flashcard/

Currently 34 topics, 1245 quiz questions, and 831 flashcards.

**Nothing is collected and nothing leaves the browser.** There is no name, email,
or group prompt, and no score reporting to an instructor. Both modes keep a
history in that browser's local storage, viewable from the **Stats** button, and
that is the only place results are stored. Clearing site data clears the history.

## Quick start

Open the live link above, or run it locally. Because the app fetches `data.js` and
`toc.yml`, it needs a real server, not `file://`:

```bash
python3 -m http.server 8000    # then open http://localhost:8000
```

To check the content after an edit:

```bash
npm test    # no dependencies to install
```

## How students use it

- **Quiz:** pick a topic, or Quick-Exam for 10 random mixed-topic questions.
  Multiple choice, one question at a time, with instant feedback and an
  explanation for every option.
- **Flashcards:** pick a topic, flip cards, mark "I knew it" or "review again".
  Unknown cards keep resurfacing until you know them.

## Repo layout

| File | Purpose |
|------|---------|
| `index.html` | The entire app: styles, markup shell, and all JS logic. |
| `data.js` | All content: `COURSE_DATA = { courseName, topics: [...] }`. Loaded via `<script src="data.js?v=N">`. |
| `toc.yml` | Controls which topics are visible to students. |
| `topic-repo-map.md` | Maps each topic to the repo notebook its questions are grounded in. |
| `check-answer-balance.js` | Checks the content for answer-balance tells. |
| `tools/` | Helper scripts for bulk content edits (see "Editing content in bulk"). |
| `package.json` | Wires up `npm test` / `npm run check`. No dependencies. |
| `.githooks/pre-commit` | Opt-in hook that runs the check on commits touching `data.js`. |
| `.github/workflows/deploy-pages.yml` | Deploys to GitHub Pages on every push to `main`. |
| `.github/workflows/quiz-data-check.yml` | Runs the content check on pull requests, on pushes to `main`, and on demand. |
| `ARCHITECTURE.md` | Diagrams: what the browser loads, and how a content edit reaches the live site. |
| `DESIGN.md`, `PRODUCT.md` | Design system and product/brand guidelines. |

## Updating course content

All topics, questions, and flashcards live in `data.js` under
`COURSE_DATA.topics`, never in `index.html`. Each topic is
`{ id, name, quiz: [...], cards: [...] }`, and each quiz question is:

```js
{
  q: "The question text",
  options: ["...", "...", "...", "..."],
  answer: 2,                     // 0-based index into options
  note: "**Correct:** ...",      // explanation, see below
  weblink: "https://...",
  difficulty: "medium"           // optional, documentation only
}
```

The `note` is what the student reads after answering. Keep the established
structure so it renders consistently: a `**Correct:**` line, a `**Wrong:**` list
with one bullet per distractor, an optional `**Further Explanation:**`, and a
closing `🔗 **WebLink:**`.

For adding or expanding a whole topic, follow the `add-quiz-topic` skill in
`.claude/skills/add-quiz-topic/SKILL.md`. It covers sourcing, the exact schema,
grounding questions in course material, and validation.

### Two rules that are easy to miss

**Bump the cache-buster.** Every time you change `data.js`, increment `N` in
`<script src="data.js?v=N">` in `index.html`. Browsers cache the file
aggressively by URL, so without the bump a normal refresh keeps serving the old
content. This is the most common reason an edit "does not show up".
(`toc.yml` is fetched with no-store and needs no bump.)

**Keep `data.js` pretty-printed.** It is stored as `const COURSE_DATA = ` followed
by `JSON.stringify(data, null, 2)`. Any script that rewrites the file must
reproduce that form:

```js
fs.writeFileSync('data.js', 'const COURSE_DATA = ' + JSON.stringify(data, null, 2) + ';\n');
```

A bare `JSON.stringify(data)` collapses all 20,700 lines onto one. Git is
line-based, so a one-line file makes every edit "line 1 changed": unrelated
changes then conflict, diffs become unreadable, and `git blame` on a question
stops working. The indentation costs about 2 percent once gzipped.

## Hiding a topic from students

`toc.yml` lists every topic by id. Comment out a line (add a leading `#`) to hide
that topic from the Quiz picker, Flashcards picker, and Quick-Exam without
deleting its content from `data.js`. Remove the `#` to show it again. No
cache-buster bump needed. If `toc.yml` is missing or empty the app fails open and
shows every topic.

## Writing good questions

A question can be factually perfect and still be a bad question, if the correct
option can be spotted without reading it. `npm test` enforces the three tells
below, but the checks only compare lengths, indices, and markup: they cannot tell
whether an edit is still *true*. Read what you change.

**Do not let the correct option stand out.**

- **Length.** Keep it within 1.3x the average distractor length. When it runs
  long, the fix is usually to trim it rather than pad the distractors, since
  padding just trades one tell ("longest is right") for another ("wordy and
  hedged is wrong"). Move the reasoning into the `note`, which is where the
  student reads it anyway.
- **Position.** Spread the answer across all four indices. The check flags a
  topic where one index is correct in 40 percent or more of its questions.
- **Formatting.** If you bold the key phrase in the answer, bold something in the
  distractors too, or bold nothing. The same applies to inline code and to
  trailing parenthetical glosses. Emphasis that appears on only the correct
  option, or on every option *except* the correct one, is equally revealing.

**Match the shape of the distractors.** If the answer justifies itself while the
distractors are bare, the justification is the giveaway. `Vector A and Vector B:
they point in nearly the same direction` next to `Vector B and Vector C` should
simply be `Vector A and Vector B`.

**Treat mirrored options identically.** Where two options are the same sentence
with one term swapped (Setting A versus Setting B), edit both the same way, or the
one you touched becomes the odd one out.

**Lengthen a distractor only by appending at the end.** The `note`'s `**Wrong:**`
bullets often quote a fragment of an option. Inserting a word into the middle
breaks that quotation silently.

**Never invent mechanics to pad a distractor.** Vague filler is harmless, but a
false statement about how something works is a content bug, and no check here
can catch it.

## Editing content in bulk

`tools/` holds the scripts used to rewrite options across many questions at once.
Plain Node, no dependencies. Each one takes the path to a `data.js` explicitly, so
point them at a copy first and only promote it once the checks pass:

```bash
cp data.js /tmp/try.js                          # work on a copy
node tools/dump.js      /tmp/try.js 5,9         # list length-flagged questions
node tools/fmtdump.js   /tmp/try.js 5,9         # list questions where emphasis singles the answer out
node tools/apply.js     /tmp/try.js patch.json  # apply rewrites (add --dry to preview)
node tools/notecheck.js /tmp/try.js 5           # check note bullets still match their options
cp /tmp/try.js data.js                          # promote, then bump the cache-buster
```

A patch file is a list of edits, keyed by the *existing* option text:

```json
[{ "topic": 5, "q": 17, "correct": "New text for the correct option",
   "opts": { "old distractor text": "new distractor text" } }]
```

`apply.js` refuses to touch the correct option unless you pass `correct`
explicitly, so an edit can never silently move the answer. It also refuses to
string-replace an option shorter than 8 characters into a note, because a
one-character option such as the SQL operator `*` will match the note's own bold
markers and shred it.

**Check the orphan set, not the count.** A note's `**Wrong:**` bullets often quote
only a *fragment* of an option, so editing an option can leave a bullet matching
nothing. `notecheck.js` reports those.

Two things to know before reading its output:

- **It exits 1 whenever any orphan exists, and roughly 570 already do.** That is
  not 570 bugs. Many notes paraphrase their distractors (`*"min to max"*` for an
  option reading "The full range from minimum to maximum value") instead of
  quoting them, which is perfectly fine and renders correctly. A non-zero exit is
  therefore the normal state, not a failure signal.
- **The signal is a change in the set, not the total.** Capture the orphan list
  before your edit and diff it against the list after. One newly broken bullet
  plus one coincidentally repaired elsewhere nets to zero on a count and hides the
  damage. Comparing sets this way is what caught 11 broken bullets during the
  answer-balance cleanup.

The practical rule that avoids the problem entirely: **only ever lengthen a
distractor by appending to the end of it.** Inserting a word into the middle is
what breaks a fragment quotation.

## Data checks

Plain Node, no dependencies.

- **`npm test`** (or `npm run check`) runs `node --check data.js` then
  `check-answer-balance.js`, and fails on a syntax error or any flagged tell.
  Pass topic ids to narrow it: `node check-answer-balance.js 22,23`.
- **Pre-commit hook**, once per clone: `git config core.hooksPath .githooks`.
  It then runs the check on any commit touching `data.js`. Bypass in an emergency
  with `git commit --no-verify`.
- **CI** runs the same check on pull requests touching `data.js`,
  `check-answer-balance.js`, or `package.json`, on every push to `main`, and on
  demand from the **Actions** tab.

The check also reports two things it does not fail on: how often "pick the single
longest option" would win (should sit near the 25 percent chance level), and any
question it exempted from the length rule because the correct option is under 12
characters, where a length ratio over one-word options such as `Mean` and `Median`
is noise rather than a tell.

## Deploying

Handled by `.github/workflows/deploy-pages.yml`. There is no build step: the repo
checkout *is* the site, so the workflow uploads it as a Pages artifact and
deploys. Every push to `main` redeploys, and you can trigger one by hand from the
**Actions** tab.

One-time setup, in **Settings, then Pages**: set **Source** to **GitHub Actions**,
NOT "Deploy from a branch". From the CLI:

```bash
gh api -X PUT repos/<owner>/<repo>/pages -f build_type=workflow
```

Do this *after* the workflow file is on `main`. Flipping it first leaves Pages
with no artifact to serve, and the live site goes blank until the first run
finishes.
