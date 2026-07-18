---
name: add-quiz-topic
description: Add a new topic (quiz questions and flashcards) to the Quiz Academy app, sourced from the course book. Use when asked to add, generate, or expand quiz/flashcard content for a specific lecture topic.
---

# Add a quiz topic

This project (`data.js` plus `index.html`) is a static quiz/flashcard app for a Data Science/ML/AI bootcamp. This skill is the repeatable, error-checked path for adding one new topic, replacing the ad hoc process used the first time (which caused real problems: unverified merges, stale browser caching, an agent that kept taking unrequested action on the live files).

## 1. Find the source material

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

Base every question on concepts actually present in that text, plus well-established knowledge that directly supports those concepts. Don't invent facts.

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
      "note": "**Correct:** ...\n\n**Wrong:**\n- *\"wrong option\"*: why...\n\n**Further Explanation:** ...\n\n🔗 **WebLink:** ...",
      "weblink": "https://..."
    }
  ],
  "cards": [
    { "q": "...", "note": "...", "explain": "...", "weblink": "https://..." }
  ]
}
```

Rules:
- 4 (occasionally 5) options per quiz item, `answer` is the 0-based correct index.
- No `image` field on new content, there is nowhere to host new images. The renderer degrades gracefully without one.
- No em dash or double hyphen in prose. Code syntax that legitimately contains two hyphens (git flags like `--global`, SQL comments) is fine, it isn't prose punctuation.
- `weblink` must be a real URL you're confident exists (prefer Wikipedia or official docs). Never fabricate one; use a Wikipedia article on the exact concept instead if unsure.
- Vary question style (definitional, scenario-based, comparison, "why it matters"), don't repeat one shape for every item.
- Target roughly 40-45 quiz items and 28-32 cards per topic, matching the depth of existing topics.

## 3. Merge into `data.js`

Append the new topic object to `COURSE_DATA.topics`. Do this as one deliberate edit, not something delegated to a subagent to merge unsupervised.

## 4. Bump the cache-buster

In `index.html`, find `<script src="data.js?v=N"></script>` and bump `N`. This is required every single time `data.js` changes, browsers cache the large static file aggressively by URL, and a normal refresh will keep serving the old topic list otherwise. This is the single most common failure mode when adding a topic.

## 5. Validate before calling it done

```bash
node --check data.js
```

Then parse `COURSE_DATA` (e.g. via Node's `vm` module, since it's declared with `const` and won't attach to a sandbox global on its own) and check:
- every topic `id` is unique
- every quiz item's `answer` index is within its `options` array
- every quiz/card item has exactly the expected fields (no stray extras, no missing `q`)
- no em dash, and no double hyphen outside legitimate code syntax

Finally, actually load the app in a browser (a plain `python3 -m http.server` from this folder is enough) and click through the new topic in both Quiz and Flashcards, confirming the topic list shows it, the gate/quiz flow works, and there are no console errors. Don't rely on a subagent's self-reported validation alone, re-run the checks yourself.
