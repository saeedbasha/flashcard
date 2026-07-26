// Compactly dumps the length-bias-flagged questions for given topics, showing
// each option's stripped length and the target average the distractors need to
// reach for the ratio to fall below 1.3.
const fs = require('fs');
const d = new Function(fs.readFileSync(process.argv[2], 'utf8') + '; return COURSE_DATA;')();
const ids = process.argv[3].split(',').map(Number);
const strip = s => s.replace(/[`*]/g, '').trim();

for (const t of d.topics) {
  if (!ids.includes(t.id)) continue;
  const out = [];
  t.quiz.forEach((q, i) => {
    const lens = q.options.map(o => strip(o).length);
    const cl = lens[q.answer];
    const wr = lens.filter((_, k) => k !== q.answer);
    const avg = wr.reduce((a, b) => a + b, 0) / wr.length;
    if (!avg || cl / avg < 1.3) return;
    out.push(`\n--- Q${i + 1}  ratio=${(cl / avg).toFixed(2)}  correct=${cl}  avgWrong=${Math.round(avg)}  NEED avg>=${Math.ceil(cl / 1.3)}`);
    out.push(`Q: ${q.q.replace(/\s+/g, ' ').slice(0, 150)}`);
    q.options.forEach((o, k) => out.push(`  [${k}]${k === q.answer ? '*' : ' '} (${lens[k]}) ${o}`));
  });
  if (out.length) { console.log(`\n########## TOPIC ${t.id}: ${t.name} ##########`); console.log(out.join('\n')); }
}
