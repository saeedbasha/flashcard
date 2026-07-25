---
name: add-quiz-topic
description: Add a new topic (quiz questions and flashcards) to the Quiz Academy app, sourced from the course book. Use when asked to add, generate, or expand quiz/flashcard content for a specific lecture topic.
---

# Add a quiz topic

This project (`data.js` plus `index.html`) is a static quiz/flashcard app for a Data Science/ML/AI bootcamp. This skill is the repeatable, error-checked path for adding one new topic, replacing the ad hoc process used the first time (which caused real problems: unverified merges, stale browser caching, an agent that kept taking unrequested action on the live files).

## 0. Topic structure at a glance (read this first)

Every topic has exactly **12 quiz questions** in the order **8 `easy`, 3 `medium`, 1 `hard`** (each item also carries an explicit `difficulty` field; position encodes the tier). There are two kinds of topic:

- **Notebook-linked topics** (26 of them): **9 book questions + 3 repo questions**. The 3 repo questions supply **2 easy + 1 medium**; the book portion keeps **6 easy + 2 medium + 1 hard**. The single **hard question is ALWAYS a book question**, never a repo question.
- **Book-only topics** (8 of them: ids **1, 3, 17, 27, 28, 31, 32, 33**): all **12 questions are book questions**. No repo.

Plus flashcards (`cards`): match the count of existing topics in the same family (older DS topics carry roughly 30 cards, the later MLE topics carry 15). When adding to an existing topic, match its current card count.

If you are adding a brand new notebook-linked topic, decide the 9/3 split up front. If you are only editing an existing topic, preserve whatever split it already has.

## 1. Find the source material

### Book source (all topics)

The real course content lives in a local mirror of the course book at:

```
/Users/saied/Desktop/websites/install book/neuefische.github.io/onions-interval-book/sessions/*.html
```

Find the session file(s) matching the requested topic. Extract clean text from the `<article>` element before writing questions (raw HTML has too much theme chrome to read well). A minimal extraction, given `beautifulsoup4` is installed:

```python
from bs4 import BeautifulSoup
soup = BeautifulSoup(open(PATH, encoding='utf-8').read(), 'html.parser')
article = soup.select_one('article') or soup.select_one('main')
print(article.get_text("\n", strip=True))
```

Base every book question on concepts actually present in that text, plus well-established knowledge that directly supports those concepts. Don't invent facts.

### Repo source (notebook-linked topics only)

The 3 repo questions must be grounded in that topic's linked repository, which lives locally under:

```
/Users/saied/Desktop/ds-quizzes-flashcards/repos/<repo-name>/
```

`repos/` is a set of local clones and is **gitignored** (never committed). To find the right repo and notebook files for a topic, read the committed map at the project root:

```
topic-repo-map.md
```

That file lists, for every notebook topic, its repo and the specific notebook file(s) its repo questions draw from, plus the 8 book-only topics. **Always take the repo and notebook paths from `topic-repo-map.md`, do not guess them from memory.** A memory-reconstructed map has previously pointed topics at the wrong repo (for example Topic 2 was once checked against `ds-linear-regression` when its real source is `ds-hands-on-ml`), which produced false "ungrounded" findings and nearly shipped wrong content. Before using any path, confirm it exists on disk (`ls` it); if a topic or repo is missing from the map, stop and ask rather than guessing.

Rules for repo questions:
- Ground them strictly in the **first (at most second) notebook** listed for that topic. Parse the `.ipynb` as JSON and read the markdown and code cells (and any printed cell outputs) before writing.
- Prefer applied, notebook-specific content: what the code does, a computed value shown, a concept the notebook demonstrates.
- Difficulty: exactly **2 easy + 1 medium** across the 3 repo questions. Do NOT write a hard repo question.
- The note ends with a `Source:` line naming the notebook file (see the schema below), **not** a WebLink.
- If a listed notebook is an empty template stub, ground the questions in whichever listed notebook actually has content, and say so.

## 2. Match the exact schema

Look at an existing topic in `data.js` for the ground truth (e.g. `COURSE_DATA.topics[0]`). Required shape:

```json
{
  "id": <next sequential integer>,
  "name": "<N>. <Title>",
  "quiz": [
    {
      "q": "...",
      "options": ["...", "...", "...", "..."],
      "answer": 0,
      "difficulty": "easy",
      "note": "**Correct:** ...\n\n**Wrong:**\n- *\"wrong option\"*: why...\n\n**Further Explanation:** ...\n\n🔗 **WebLink:** ...",
      "weblink": "https://..."
    }
  ],
  "cards": [
    { "q": "...", "note": "...", "explain": "...", "weblink": "https://..." }
  ]
}
```

### Note structure (fixed)

Every quiz note follows this order: `**Correct:** ...` then a blank line, `**Wrong:**` with one `- ` bullet per wrong option (each in the form `- *"wrong option text"*: why it is wrong`), then a blank line, `**Further Explanation:** ...`, then the closing reference line. The Wrong bullets reference option **text**, not index, which is what makes it safe to rebalance answer positions later by swapping options.

The closing reference line differs by question kind:
- **Book question:** `🔗 **WebLink:** <short description>` and a real `weblink` URL field.
- **Repo question:** `Source: \`<notebook base filename>.ipynb\`` and **no** `weblink` field or WebLink line.

Flashcard notes do not use the Correct/Wrong structure; they are a direct answer, with an optional deeper `explain` field and a `weblink`.

### Rules

- 4 (occasionally 5) options per quiz item, `answer` is the 0-based correct index. Exactly one option is defensibly correct; distractors are plausible but clearly wrong.
- Every quiz item carries an explicit `difficulty` (`easy`/`medium`/`hard`) matching its position (items 1-8 easy, 9-11 medium, 12 hard).
- No `image` field on new content, there is nowhere to host new images. The renderer degrades gracefully without one. (Legacy `image` URLs exist on topics 1-12 only.)
- No em dash or double hyphen in prose. Code syntax that legitimately contains two hyphens (git flags like `--global`, `--cached`, SQL comments) is fine, it isn't prose punctuation.
- `weblink` (book questions) must be a real URL you're confident exists (prefer Wikipedia or official docs). Never fabricate one.
- Vary question style (definitional, scenario-based, comparison, "why it matters"), don't repeat one shape for every item, and don't duplicate a concept already covered by another question in the same topic or by another topic.
- **Answer balance:** keep the correct option from being conspicuously the longest (at most 1.3x the average distractor length), and spread the correct answer across option positions rather than parking it at one index (the checker flags a topic where one index is correct in >= 40% of its questions).

## 3. Merge into `data.js`

Append or edit the topic object in `COURSE_DATA.topics`. Do this as one deliberate edit, not something delegated to a subagent to merge unsupervised. `data.js` is a single minified `const COURSE_DATA = {...};`; a safe way to edit programmatically is to load it via Node's `vm` module, mutate the object, and rewrite the file with `JSON.stringify` (this preserves untouched topics byte for byte). When replacing a specific string, assert it matches exactly once before writing, and guard that the replacement introduces no em dash or double hyphen in prose.

## 4. Bump the cache-buster

In `index.html`, find `<script src="data.js?v=N"></script>` and bump `N`. This is required every single time `data.js` changes, browsers cache the large static file aggressively by URL, and a normal refresh will keep serving the old topic list otherwise. This is the single most common failure mode when adding a topic. (`toc.yml`, which controls topic visibility, is fetched with `cache: 'no-store'` and needs no bump.)

## 5. Validate before calling it done

```bash
node --check data.js
npm test    # runs node --check + check-answer-balance.js across all topics
```

`npm test` fails on a syntax error, a length-bias flag, or a position-bias flag. Also parse `COURSE_DATA` (via Node's `vm` module, since it's declared with `const`) and check:
- every topic `id` is unique
- every quiz item's `answer` index is within its `options` array
- exactly 12 quiz items per topic, in the 8 easy / 3 medium / 1 hard order
- every quiz/card item has exactly the expected fields (no stray extras, no missing `q`)
- each note has a `**Correct:**`, a `**Wrong:**` bullet per wrong option, a `**Further Explanation:**`, and the correct closing line (WebLink for book, `Source:` for repo)
- for repo questions, every factual claim and number is actually supported by the source notebook
- no em dash, and no double hyphen outside legitimate code syntax

You can target the balance check at just the topic(s) you added:

```bash
node check-answer-balance.js <new topic id(s), comma separated>
```

Finally, actually load the app in a browser (`python3 -m http.server` from this folder is enough), hard-refresh, and click through the new topic in both Quiz and Flashcards, confirming the topic list shows it, the gate/quiz flow works, and there are no console errors. Don't rely on a subagent's self-reported validation alone, re-run the checks yourself.

## 6. Quality bar (what a later audit looks for)

New content is later audited the same way the whole app was audited once. Write to clear these bars up front so nothing has to be re-fixed:

- **Answer correctness:** a knowledgeable reader answering blind (no key) should pick your keyed answer, and should not find a second defensible option. If two options are both arguably correct, the item is broken.
- **Grounding:** every repo-question claim traces to the named source notebook; every book-question claim traces to the book text or well-established fact.
- **Terminology precision:** use terms a junior learner could otherwise absorb wrong. Common slips to avoid: calling a hyperparameter (K, tree depth, learning rate, number of clusters, regularization strength) a "parameter"; conflating correlation with causation; mixing accuracy / precision / recall / F1 or loss vs metric vs cost; conflating normalization with standardization; getting the residual sign convention wrong (residual = observed minus predicted); calling deletion "imputation"; calling one weight-update iteration an "epoch".
- **No internal contradictions:** two cards or questions in the same topic must not define the same term differently.

## 7. Commit

An opt-in pre-commit hook runs the data check automatically on any commit that touches `data.js`. Enable it once per clone with:

```bash
git config core.hooksPath .githooks
```

Then a bias or syntax regression blocks the commit (bypass in an emergency with `git commit --no-verify`). CI runs the same `npm test` on pull requests that touch `data.js`. Do not merge content to `main` without the author's go-ahead; open a draft PR for review rather than merging directly.
