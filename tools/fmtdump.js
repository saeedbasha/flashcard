// Lists the questions where markdown emphasis singles the correct option out,
// with every option shown, so the parallel phrase can be emphasised in the
// distractors too. Companion to check-answer-balance.js's formatting-bias check.
//
// Usage: node fmtdump.js <data.js> <topicIds e.g. 8,14>
const fs = require('fs');
const d = new Function(fs.readFileSync(process.argv[2], 'utf8') + '; return COURSE_DATA;')();
const ids = process.argv[3].split(',').map(Number);

const EMPHASIS = {
  bold: s => /\*\*/.test(s),
  code: s => /`/.test(s),
  italics: s => /\*/.test(s.replace(/\*\*/g, '')),
};

for (const t of d.topics) {
  if (!ids.includes(t.id)) continue;
  const out = [];
  t.quiz.forEach((q, i) => {
    const wrong = q.options.filter((_, k) => k !== q.answer);
    if (wrong.length < 2) return;
    const hits = [];
    for (const [style, has] of Object.entries(EMPHASIS)) {
      const on = has(q.options[q.answer]);
      const n = wrong.filter(has).length;
      if (on && n === 0) hits.push(`${style}:only-correct`);
      else if (!on && n === wrong.length) hits.push(`${style}:only-correct-lacks`);
    }
    if (!hits.length) return;
    out.push(`\n--- Q${i + 1}  [${hits.join(' ')}]`);
    q.options.forEach((o, k) => out.push(`  [${k}]${k === q.answer ? '*' : ' '} ${o}`));
  });
  if (out.length) { console.log(`\n########## TOPIC ${t.id}: ${t.name} ##########`); console.log(out.join('\n')); }
}
