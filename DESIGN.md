---
name: Quiz Academy (Local)
description: A neue fische / SPICED-branded quiz and flashcard study app for bootcamp students
colors:
  orange: "#FF4A11"
  orange-deep: "#C93A0E"
  purple: "#7B3FE4"
  green: "#03AC13"
  green-deep: "#02760D"
  rose: "#E94B7B"
  rose-deep: "#C22F5C"
  charcoal: "#252629"
  gray-text: "#6B6B6B"
  gray-bg: "#F3F5F9"
  card-white: "#FFFFFF"
  code-bg: "#F7F7F9"
  border: "#E3E7EE"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.orange-deep}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.sm}"
    padding: "11px 22px"
  button-ghost:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sm}"
    padding: "11px 22px"
  card:
    backgroundColor: "{colors.card-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  quiz-card:
    backgroundColor: "{colors.card-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  option-row-correct:
    backgroundColor: "{colors.green-tint}"
    textColor: "{colors.green-deep}"
    rounded: "{rounded.md}"
    padding: "13px 15px"
  option-row-wrong:
    backgroundColor: "{colors.rose-tint}"
    textColor: "{colors.rose-deep}"
    rounded: "{rounded.md}"
    padding: "13px 15px"
  topic-row:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.md}"
    padding: "13px 15px"
---

# Design System: Quiz Academy (Local)

## 1. Overview

**Creative North Star: "The Editorial Bootcamp Brand"**

This app now runs on Saied's actual neue fische × SPICED brand system
(extracted directly from `theme-nf-spiced`, the Slidev theme used across his
other course material), not an invented palette. The goal shifted from "an
app that feels like a generic playful study tool" to "an app that visibly
belongs to the same brand as the rest of the course": students should
recognize the orange, the type rhythm, and the flat editorial card style
from lecture slides the moment they open this.

Structurally nothing changed: it's still a warm-neutral background carrying
white cards, a live streak/score, and celebratory motion on correct answers.
What changed is the visual language layered on top: one geometric sans
(Inter, no separate display face), a cooler gray-blue page background
instead of warm paper, flatter/tighter corner radii (4–12px, not pill-heavy
20px+), and a four-color semantic system where each color has exactly one
job: orange is "forward," green is "correct," rose is "wrong," purple is
"secondary/focus." Previously green did double duty as both the brand's
primary color and the correctness signal; splitting those out is a genuine
improvement, not just a reskin.

This system explicitly rejects the old "Jupyter notebook" look (monospace
`In[]:`/`Out[]:` cell tags) and mascot-driven gamification, same as before.
It keeps the earlier playful/gamified brief (streak, confetti, motion):
being on-brand doesn't mean becoming a plain corporate slide deck.

**Key Characteristics:**
- Cool, pale gray-blue background (`#F3F5F9`), not warm paper
- One Inter family throughout, no display/body pairing
- Four colors, four jobs: orange = forward, green = correct, rose = wrong,
  purple = secondary/focus/identity
- Flatter corner rhythm: 4px chips, 8–10px controls, 12px cards
- The Quick-Exam entry and the active question card both borrow the
  theme's literal `.nf-quiz` treatment: 2px orange border, pale orange
  wash, orange-tinted glow shadow

## 2. Colors

Full-palette strategy, same commitment level as before, now sourced from
Saied's real brand tokens instead of an invented set.

### Primary
- **Orange** (`#FF4A11`): the true brand accent, used for borders, icons,
  glow shadows, and any large/bold text. Not used for small body-sized text
  on a light background or white text on its own fill (fails WCAG AA at
  3.37:1); see Orange Deep for that.
- **Orange Deep** (`#C93A0E`): every primary action (Start, Next, "Try
  again"), the progress-bar fill, the active toggle/switch state, and the
  "Learn more ↗" link color. This is the "you're moving forward" color,
  darkened just enough to clear 4.5:1 against white text and against
  Card White.

### Secondary
- **Purple** (`#7B3FE4`): the brand mark, all focus rings, hover-state
  borders on rows/cards/inputs, the default (pre-answer) letter-badge
  tint, the flashcard back face, and the streak flame icon. This is the
  "secondary/interactive-but-not-forward" color: passes AA at 5.72:1
  against white, no deep variant needed.

### Tertiary
- **Green** (`#03AC13`) / **Green Deep** (`#02760D`): correct-answer state
  only. Green is the tint border/background wash; Green Deep is the badge
  fill, feedback text, and the results score number (all text-bearing
  uses, darkened to clear 4.5:1).
- **Rose** (`#E94B7B`) / **Rose Deep** (`#C22F5C`): wrong-answer state
  only, same split (Rose for tints/borders, Rose Deep for badge fill and
  feedback text).

### Neutral
- **Gray BG** (`#F3F5F9`): page background, a cool pale gray-blue.
- **Card White** (`#FFFFFF`): every card, row, and modal surface.
- **Charcoal** (`#252629`): headings and primary text.
- **Gray Text** (`#6B6B6B`): metadata, question counts, helper text.
- **Border** (`#E3E7EE`): dividers and resting-state borders.
- **Code BG** (`#F7F7F9`): inline `code` chip background, paired with
  Charcoal text; matches the theme's actual code-block token instead of
  reusing an accent color for syntax-style text.

### Named Rules
**The One Job Rule.** Each of the four accents has exactly one meaning:
Orange Deep = forward/primary action. Green = correct. Rose = wrong.
Purple = secondary/focus/identity. A color never carries two of these
meanings on the same screen.

## 3. Typography

**Font:** Inter (with ui-sans-serif, system-ui, -apple-system, sans-serif
fallback), one family for everything, matching `theme-nf-spiced`'s own
choice not to pair a separate display face.

**Character:** Headings lean on weight (700) and slightly negative
letter-spacing (-0.01em) rather than a different typeface to signal
hierarchy: the same editorial restraint the slide theme uses.

### Hierarchy
- **Display** (700, 2.75rem, 1.1, -0.01em): the final score number on
  results.
- **Title** (700, 1.3rem, 1.25, -0.01em): section headers, card titles,
  the app wordmark.
- **Body** (400–500, 1rem, 1.55): questions, answer options, explanations,
  flashcard content.
- **Label** (700, 0.8rem, uppercase, 0.02em tracking): meta tags, question
  counters, topic-row counts, badge text.

### Named Rules
**The One-Family Rule.** Inter only. No second "display" face: hierarchy
comes from weight, size, and letter-spacing, not a font swap.

## 4. Elevation

Mostly flat with soft, low-contrast shadows, directly lifted from
`theme-nf-spiced`'s own shadow vocabulary rather than invented.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 6px 18px rgba(0,0,0,.10)`):
  default state for every card and list row (the theme's `.nf-callout`
  shadow).
- **Lifted** (`box-shadow: 0 2px 4px rgba(0,0,0,.08), 0 10px 24px rgba(0,0,0,.12)`):
  hover/press state for clickable rows and buttons.
- **Orange Glow** (`box-shadow: 0 0 0 1px rgba(255,74,17,.10), 0 6px 18px rgba(255,74,17,.10)`):
  reserved for the two "this is the primary quiz thing" surfaces: the
  Quick-Exam topic row and the active question card, lifted verbatim from
  the theme's `.nf-quiz` component.

### Named Rules
**The Glow-Is-Reserved Rule.** The orange glow shadow is not a generic
hover effect. It marks exactly the two quiz-taking surfaces the theme's
own `.nf-quiz` pattern marks, nowhere else.

## 5. Components

### Buttons
- **Shape:** 8px rounded rectangle (not a pill: the theme's rhythm is
  flatter/more editorial than a bubbly app).
- **Primary:** Orange Deep background, white text.
- **Ghost:** Card White background, Charcoal text, 1px Border outline.
- **Hover / Focus:** primary darkens further; every interactive element
  gets a visible 2px Purple focus ring, offset 2px, for keyboard users.

### Cards / Containers
- **Corner Style:** 12px for page-level cards and the flip-card faces,
  10px for option rows and topic rows, 4px for badges/chips/inline code.
- **Background:** Card White on Gray BG.
- **Shadow Strategy:** Resting by default, Lifted on hover; Orange Glow
  only on the Quick-Exam row and the active quiz card.

### Option Rows (quiz answers)
- **Default:** Card White, a rounded letter badge (A/B/C/D) in a
  Purple-tinted circle.
- **Correct:** pale green wash, badge fills solid Green Deep, a small pop
  motion plays once.
- **Wrong:** pale rose wash, badge fills solid Rose Deep.
- **Disabled (post-answer, non-selected):** dims to 50% opacity.

### Topic List Rows (home screen)
- **Style:** flat white row, name + item count stacked left, chevron
  right; matches the QuizAcademy course-page reference screens.
- **Quick-Exam row:** the one exception to "flat white", gets the full
  `.nf-quiz` treatment (2px orange border, pale orange wash, orange glow)
  since it's the single most prominent action on the home screen.

### Streak / Score Chip
- **Style:** small rounded-rect chip, Card White background, Purple flame
  glyph (streak) or Orange Deep star glyph (score) plus a bold numeral.

### Progress Bar
- **Style:** 8px tall, fully rounded track (Border color), Orange Deep
  fill, eased width transition.

### Flip Card (flashcards)
- **Front:** Card White.
- **Back:** Purple at low tint, kept distinct from the quiz's green/rose
  feedback colors.
- **Sizing:** both faces occupy the same CSS Grid cell (`grid-area: 1/1`)
  so the card auto-sizes to whichever face's content is taller, instead of
  a fixed height that real (often multi-paragraph, bulleted) explanation
  content would overflow.

## 6. Do's and Don'ts

### Do:
- **Do** keep each accent to its One Job: Orange Deep = forward, Green =
  correct, Rose = wrong, Purple = secondary/focus. Never blend two of
  these meanings into one color on the same screen.
- **Do** use the flatter 4–12px radius rhythm, not full pills, for anything
  brand-visible (buttons, toggles, cards).
- **Do** reserve the Orange Glow shadow for the Quick-Exam row and the
  active quiz card only.
- **Do** run all markdown-bearing text (`item.q`, options, explanations)
  through `mdLite()`, never raw `escapeHtml()`: real course content is
  markdown-formatted (bold, italics, bullet lists, inline code).
- **Do** respect `prefers-reduced-motion` for confetti and the card flip.

### Don't:
- **Don't** bring back the Jupyter-notebook look or a mascot/cartoon
  gamification layer.
- **Don't** use pure `#000`/`#fff`: Charcoal and Card White stand in.
- **Don't** use a colored `border-left`/`border-right` stripe as a generic
  accent (the one deliberate exception the source theme uses, the QA
  answer-reveal border-left, was not carried over; we use full borders/
  tints instead).
- **Don't** introduce a second font family.
- **Don't** make `.face .content` (or any element holding raw `mdLite()`
  output) a flex container directly: mixed text/`<br>`/`<ul>` children get
  fragmented into separate flex items instead of flowing as normal text.
  Wrap markdown output in a plain block child first, then center that.
