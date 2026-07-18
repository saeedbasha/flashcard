# Product

## Register

product

## Users

Saied's data science bootcamp students. They open a shared link on their own
time (laptop or phone, browser) to drill ML/DS quiz questions or flashcards
before an exam, project checkpoint, or just to self-check understanding. No
accounts, no login, no instructor-facing dashboard: a personal study tool,
used solo, often in short bursts between other work.

## Product Purpose

A single-file, no-install quiz + flashcard app. Paste or upload a JSON
question set (any topic), then either take a scored multiple-choice quiz or
work through flashcards with spaced re-surfacing of cards marked "don't know
yet." Attempts are saved to the browser's local storage so a student can see
their own progress over time. Success looks like: a student opens the link,
starts practicing within seconds, and wants to come back before the next
exam because it felt encouraging rather than like homework.

## Brand Personality

Playful and gamified, three words: encouraging, energetic, rewarding. Takes
cues from QuizAcademy's clean card-based layout and generous whitespace as
the structural base, but leans further into game feel on top of it: visible
momentum (streaks, live score), a rewarding moment on correct answers
(confetti/motion burst). Never condescending or childish: playful in
feedback and motion, not in tone of voice.

Visually the app now runs on Saied's actual neue fische × SPICED brand
system (extracted from `theme-nf-spiced`, the Slidev theme used across his
other course material): orange `#FF4A11` as the primary accent, charcoal
`#252629` and purple `#7B3FE4` as secondary brand colors, Inter throughout,
flatter 4–12px corner rhythm. See `DESIGN.md` for the full token set; it
supersedes any earlier invented palette.

## Anti-references

- The previous version's "Jupyter notebook" look: monospace `In[]:`/`Out[]:`
  cell tags, code-editor teal/amber palette. This should read as a study
  app, not a dev tool.
- Generic Duolingo-style mascot-driven gamification (cartoon characters,
  heavy illustration). Gamification here means motion, color, and streak/
  score feedback, not a mascot or narrative layer.

## Design Principles

- Momentum is visible. The student should always see their current
  streak/score without hunting for it, and progress should never feel
  reset-to-zero or punitive.
- Correct answers feel good, wrong answers feel safe. Positive feedback is
  celebratory (motion, color); negative feedback is calm and informative
  (the explanation is the point, not the miss).
- One clear action per screen. The next thing to do (answer, flip, start,
  try again) is always the single obvious affordance.
- Zero setup between "open link" and "first question." No accounts, no
  required configuration; the sample deck and drag-and-drop JSON upload
  exist specifically to keep this true.
- Structure over decoration. The QuizAcademy-style card/list layout and
  whitespace carry the "clean" half of the personality so the "playful"
  half (motion, streak, confetti) has room to read as intentional rather
  than cluttered.

## Accessibility & Inclusion

Standard best practices: solid color contrast (WCAG AA) even with a more
saturated palette, visible focus states on every interactive element,
full keyboard operability (options, buttons, file upload, card flip),
`prefers-reduced-motion` respected for confetti/motion effects.
