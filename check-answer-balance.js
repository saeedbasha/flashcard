#!/usr/bin/env node
// Flags three independent "guess without reading the question" tells in quiz data:
//   1. Length bias: the correct option is noticeably longer than the AVERAGE wrong option,
//      which lets a student score above chance by just picking the longest string.
//   2. Position bias: the correct option lands on the same index far more than chance.
//   3. Formatting bias: markdown emphasis (bold, inline code, italics) or a trailing
//      parenthetical gloss singles the correct option out, so it can be spotted without
//      reading any of the text. This one is easy to introduce by accident, because
//      emphasising or explaining the key phrase of a well-written answer is a natural thing
//      to do while the throwaway distractors get left as plain prose. Checked in both
//      directions: a style unique to the correct option, and a style on every distractor but
//      absent from the correct one.
// Doesn't touch data.js, just reports.
//
// Note: the length check uses the AVERAGE distractor length, not the single longest wrong
// option. An earlier version compared against the longest wrong option only, which was too
// lenient and reported "0 flagged" while "pick the longest" still won ~half the time.
//
// Usage:
//   node check-answer-balance.js            # check every topic
//   node check-answer-balance.js 22,23,24    # check only these topic ids (e.g. a topic you just added)

const fs = require('fs');
const vm = require('vm');

const THRESHOLD_RATIO = 1.3; // flag when the correct option is >= 30% longer than the AVERAGE wrong option
const MIN_LENGTH_FOR_RATIO = 12; // below this the correct option is a single word, where a length ratio means nothing
const POSITION_SHARE_THRESHOLD = 0.4; // flag a topic if one answer index accounts for >= 40% of its questions

const src = fs.readFileSync('data.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
// data.js declares COURSE_DATA with `const`, which doesn't attach to the sandbox
// object on its own, so re-expose it explicitly after running the source.
vm.runInContext(src + '\nthis.COURSE_DATA = COURSE_DATA;', sandbox);
const COURSE_DATA = sandbox.COURSE_DATA;

function stripMd(s) {
  return s.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
}

// Markdown emphasis styles checked for tell #3. Italics has to ignore both
// bold's `**` and anything inside a code span, otherwise a glob pattern such as
// `test_*.py` reads as an italic marker and reports a tell that isn't there.
const stripCodeSpans = s => s.replace(/`[^`]*`/g, '');

// A trailing "(...)" explaining the answer is the same odd-one-out tell as bold,
// just punctuation instead of markup. Two exclusions keep it from firing on
// things that only look like a gloss:
//   - it must be preceded by whitespace, so a call such as
//     `pytest.raises(ZeroDivisionError)` does not count
//   - it must contain a word of 3+ letters, so maths does not count:
//     "squeezes any input into (0, 1)", "(n < 30)", '("4 to 1")'
const trailingGloss = s => {
  const m = s.trim().match(/(^|\s)\(([^()]*)\)$/);
  return !!m && /[A-Za-z]{3,}/.test(m[2]);
};

const EMPHASIS = {
  bold: s => /\*\*/.test(s),
  'inline code': s => /`/.test(s),
  italics: s => /\*/.test(stripCodeSpans(s).replace(/\*\*/g, '')),
  'trailing gloss': trailingGloss,
};

const onlyIds = process.argv[2]
  ? new Set(process.argv[2].split(',').map(s => parseInt(s.trim(), 10)))
  : null;

let totalChecked = 0;
let singleLongestCount = 0; // how often the correct option is the single longest ("pick the longest" would win)
const flagged = [];
const tooShortToJudge = [];
const positionSkewedTopics = [];
const overallPositionCounts = {};
const formatFlagged = [];

for (const topic of COURSE_DATA.topics) {
  if (onlyIds && !onlyIds.has(topic.id)) continue;

  const topicPositionCounts = {};

  topic.quiz.forEach((item, idx) => {
    totalChecked++;
    const lens = item.options.map(o => stripMd(o).length);
    const correctLen = lens[item.answer];
    const wrongLens = lens.filter((_, i) => i !== item.answer);
    const maxWrong = Math.max(...wrongLens);

    topicPositionCounts[item.answer] = (topicPositionCounts[item.answer] || 0) + 1;
    overallPositionCounts[item.answer] = (overallPositionCounts[item.answer] || 0) + 1;

    // Formatting bias. Flag either direction: emphasis unique to the correct
    // option, or emphasis on every distractor and absent from the correct one.
    // Both let a reader pick the odd one out on appearance alone.
    const wrongOpts = item.options.filter((_, i) => i !== item.answer);
    if (wrongOpts.length >= 2) {
      for (const [style, has] of Object.entries(EMPHASIS)) {
        const onCorrect = has(item.options[item.answer]);
        const onWrong = wrongOpts.filter(has).length;
        if (onCorrect && onWrong === 0) {
          formatFlagged.push({ topicId: topic.id, questionNumber: idx + 1, q: item.q, style, direction: 'only the correct option uses' });
        } else if (!onCorrect && onWrong === wrongOpts.length) {
          formatFlagged.push({ topicId: topic.id, questionNumber: idx + 1, q: item.q, style, direction: 'only the correct option omits' });
        }
      }
    }

    if (maxWrong === 0) return;

    const avgWrong = wrongLens.reduce((a, b) => a + b, 0) / wrongLens.length;
    const overallMax = Math.max(...lens);
    const isSingleLongest = correctLen === overallMax && lens.filter(l => l === overallMax).length === 1;
    if (isSingleLongest) singleLongestCount++;

    const avgRatio = correctLen / avgWrong;

    // A ratio over one-word options is not a tell anyone can act on: "Median"
    // beats "Mean" by two characters and scores 1.38x, but no reader picks an
    // answer by counting letters at that scale. Below the floor the ratio is
    // measuring the metric's own resolution, not the question, so skip it and
    // report the skip rather than quietly passing it.
    if (correctLen < MIN_LENGTH_FOR_RATIO) {
      // Only worth reporting the ones the floor actually rescues; the rest were
      // passing anyway and would just be noise.
      if (avgRatio >= THRESHOLD_RATIO) {
        tooShortToJudge.push({ topicId: topic.id, questionNumber: idx + 1, q: item.q, correctLen, avgWrong, avgRatio });
      }
      return;
    }

    if (avgRatio >= THRESHOLD_RATIO) {
      flagged.push({
        topicId: topic.id,
        topicName: topic.name,
        questionNumber: idx + 1,
        q: item.q,
        avgRatio,
        correctLen,
        avgWrong,
        isSingleLongest,
      });
    }
  });

  const topicTotal = topic.quiz.length;
  for (const [index, count] of Object.entries(topicPositionCounts)) {
    const share = count / topicTotal;
    if (topicTotal >= 8 && share >= POSITION_SHARE_THRESHOLD) {
      positionSkewedTopics.push({ topicId: topic.id, topicName: topic.name, index, count, topicTotal, share });
    }
  }
}

flagged.sort((a, b) => b.avgRatio - a.avgRatio);
positionSkewedTopics.sort((a, b) => b.share - a.share);

console.log(`Checked ${totalChecked} question(s)${onlyIds ? ` in topic(s) ${[...onlyIds].join(', ')}` : ' across all topics'}.\n`);

console.log(`--- Length bias ---`);
console.log(`Flagged ${flagged.length} question(s) where the correct answer is >= ${THRESHOLD_RATIO}x the average wrong-option length.\n`);
for (const f of flagged) {
  console.log(`[Topic ${f.topicId} "${f.topicName}" Q${f.questionNumber}] ${f.avgRatio.toFixed(2)}x avg (correct ${f.correctLen} chars, avg wrong ${f.avgWrong.toFixed(0)} chars)${f.isSingleLongest ? ' [also the single longest option]' : ''}`);
  console.log(`  ${f.q}`);
}
if (tooShortToJudge.length) {
  console.log(`\nExempted ${tooShortToJudge.length} question(s) that exceed ${THRESHOLD_RATIO}x but whose correct option is under ${MIN_LENGTH_FOR_RATIO} chars, where the ratio is noise rather than a tell:`);
  for (const s of tooShortToJudge) {
    console.log(`  [Topic ${s.topicId} Q${s.questionNumber}] ${s.avgRatio.toFixed(2)}x but only ${s.correctLen} chars vs avg wrong ${s.avgWrong.toFixed(1)}: ${s.q.slice(0, 70)}`);
  }
}
const longestPct = totalChecked ? (100 * singleLongestCount / totalChecked).toFixed(1) : '0.0';
console.log(`\n"Pick the single longest option" would score ${singleLongestCount}/${totalChecked} (${longestPct}%). Random chance is ~25%; well above that means the correct answer is too often the longest.`);

console.log(`\n--- Position bias ---`);
console.log(`With unbiased placement across ~4 options, each index should land at roughly 25% of a topic's questions.`);
console.log(`Flagged ${positionSkewedTopics.length} topic(s) where one answer index accounts for >= ${Math.round(POSITION_SHARE_THRESHOLD * 100)}% of that topic's questions.\n`);
for (const p of positionSkewedTopics) {
  console.log(`[Topic ${p.topicId} "${p.topicName}"] index ${p.index} is correct in ${p.count}/${p.topicTotal} questions (${(p.share * 100).toFixed(0)}%)`);
}

console.log(`\n--- Formatting bias ---`);
console.log(`Markdown emphasis should never single the correct option out from its distractors.`);
console.log(`Flagged ${formatFlagged.length} question(s).\n`);
for (const f of formatFlagged) {
  console.log(`[Topic ${f.topicId} Q${f.questionNumber}] ${f.direction} ${f.style}`);
  console.log(`  ${f.q.replace(/\s+/g, ' ').slice(0, 120)}`);
}

if (!onlyIds) {
  console.log(`\nOverall answer-index distribution across all checked questions:`);
  for (const [index, count] of Object.entries(overallPositionCounts).sort((a, b) => a[0] - b[0])) {
    console.log(`  index ${index}: ${count} (${(100 * count / totalChecked).toFixed(1)}%)`);
  }
}

if (flagged.length > 0 || positionSkewedTopics.length > 0 || formatFlagged.length > 0) {
  process.exitCode = 1;
}
