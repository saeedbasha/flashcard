# Quiz Academy

A single-file quiz + flashcard app for practicing the course's topics
(loaded from `data.js`). No build step, no dependencies.

- Home screen: two cards, **Quiz** and **Flashcards**.
- Quiz mode: pick a topic (or Quick-Exam for 10 mixed questions), enter your
  name and email, then answer multiple choice questions one at a time with
  instant feedback. At the end, your name, email, topic, and score are sent
  to a Google Form so your instructor can see it. Nothing else about your
  device or session is collected.
- Flashcard mode: pick a topic, no name/email needed. Flip cards, mark
  "I knew it" / "review again"; unknown cards keep resurfacing until you
  know them. Stays entirely on your device.
- Either mode also keeps a local history in that browser's local storage,
  viewable from the **Stats** button (this is separate from, and in
  addition to, the Google Form submission for quiz attempts).

## Share it with students

This repo is just `index.html` + `data.js`.

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`.
4. Save. GitHub will publish it at:
   `https://<your-username>.github.io/<repo-name>/`

That link opens straight into the app: no slides, no navigation, just the
quiz. Share that URL with your students.

## Score delivery setup (Google Form)

Quiz results are sent to a Google Form via a silent client-side POST (see
`GOOGLE_FORM` and `submitScoreToGoogleForm()` near the top of the
`<script>` block in `index.html`). Until that config is filled in, the app
works fine, it just doesn't send anywhere.

To wire it up:

1. Create a Google Form with 5 short-answer fields, in this order:
   **Name**, **Email**, **Topic**, **Score**, **Total**.
2. In the Form editor, go to **Responses → the green Sheets icon → Select
   existing spreadsheet**, and pick the Sheet you want responses to land in.
3. Open the live form (the `.../viewform` link), click the **⋮** menu →
   **Get pre-filled link**. Fill each field with an obviously-fake value
   (e.g. `NAMEFIELD`, `test@test.com`, `TOPICFIELD`, `0`, `0`), click
   **Get link**, then **Copy link**.
4. That copied URL contains `entry.NNNNNN=value` for each field. Match each
   `entry.NNNNNN` id to the field you put that fake value in.
5. In `index.html`, fill in:
   ```js
   const GOOGLE_FORM = {
     actionUrl: "https://docs.google.com/forms/d/e/<FORM_ID>/formResponse", // the viewform URL with "viewform" replaced by "formResponse"
     entries: {
       name: "entry.111111111",
       email: "entry.222222222",
       topic: "entry.333333333",
       score: "entry.444444444",
       total: "entry.555555555"
     }
   };
   ```
6. Reload the app and run through one quiz. A new row should appear in the
   linked Sheet.

## Updating course content

Course topics, quiz questions, and flashcards all live in `data.js`
(`COURSE_DATA.topics`), not in `index.html`.
