// Validates the coupling between a quiz item's `options` and its `note`.
//
// Each note's "**Wrong:**" section has one bullet per wrong option, and each
// bullet opens by quoting that option's text verbatim inside *"..."*. If a
// distractor is reworded without updating its bullet, the note silently starts
// explaining an option that no longer exists. This script is the guard for that.
//
// Usage: node notecheck.js <data.js> [topicId]
const fs = require('fs');
const path = process.argv[2];
const onlyTopic = process.argv[3] ? Number(process.argv[3]) : null;
const d = new Function(fs.readFileSync(path, 'utf8') + '; return COURSE_DATA;')();

const norm = s => String(s)
  .replace(/[`*_]/g, '').replace(/\s+/g, ' ').replace(/[.,;:]+$/, '').trim().toLowerCase();

let checked = 0, noWrong = 0, bad = 0, okCount = 0;
const problems = [];

for (const t of d.topics) {
  if (onlyTopic && t.id !== onlyTopic) continue;
  t.quiz.forEach((q, i) => {
    checked++;
    if (!q.note || !/\*\*Wrong:\*\*/.test(q.note)) { noWrong++; return; }
    // Grab the Wrong: block up to the next bold heading or end.
    const m = q.note.match(/\*\*Wrong:\*\*([\s\S]*?)(?=\n\s*(?:\*\*|🔗)|$)/);
    if (!m) { noWrong++; return; }
    // Each bullet starts with "- " and quotes the option in *"..."*.
    const quoted = [...m[1].matchAll(/^\s*-\s*\*?"([\s\S]*?)"\*?\s*:/gm)].map(x => norm(x[1]));
    const wrongOpts = q.options.filter((_, k) => k !== q.answer).map(norm);
    if (!quoted.length) { noWrong++; return; }
    // Bullets quote either the whole option or a distinctive fragment of it
    // (both styles occur in this data), so a bullet is satisfied if its quoted
    // text is a substring of some wrong option.
    const matches = (bullet, opt) => opt === bullet || opt.includes(bullet);
    const orphan = quoted.filter(x => !wrongOpts.some(o => matches(x, o)));
    // Every wrong option should be covered by some bullet.
    const uncovered = wrongOpts.filter(o => !quoted.some(x => matches(x, o)));
    if (orphan.length) {
      bad++;
      if (problems.length < 12) problems.push({ t: t.id, q: i + 1, text: q.q.slice(0, 55), orphan, uncovered });
    } else {
      okCount++;
    }
  });
}

console.log(`checked ${checked} question(s)`);
console.log(`  notes with a parseable Wrong: block : ${checked - noWrong}`);
console.log(`  bullets all match a real option     : ${okCount}`);
console.log(`  ORPHANED bullets (desynced)         : ${bad}`);
for (const p of problems) {
  console.log(`\n  [t${p.t} Q${p.q}] ${p.text}`);
  p.orphan.forEach(o => console.log(`     orphan bullet quotes: "${o.slice(0, 70)}"`));
  p.uncovered.forEach(o => console.log(`     option with no bullet: "${o.slice(0, 70)}"`));
}
process.exitCode = bad ? 1 : 0;
