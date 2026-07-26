// Applies distractor rewrites to data.js from a patch file.
//
// Patch format: [{ topic, q (1-based), opts: { "<oldText>": "<newText>", ... } }]
//
// For each rewrite it also updates the question's `note`, because a note's
// "**Wrong:**" bullets reference the distractor. Two styles occur in this data:
// some bullets quote the option verbatim (string-replaced here), others
// paraphrase it (left alone, and kept valid by the rule that every rewrite must
// preserve the distractor's meaning, only adding specificity).
//
// Refuses to touch the correct option, so an edit can never change the answer.
//
// Usage: node apply.js <data.js> <patch.json> [--dry]
const fs = require('fs');
const [dataPath, patchPath] = process.argv.slice(2, 4);
const dry = process.argv.includes('--dry');

const src = fs.readFileSync(dataPath, 'utf8');
const data = new Function(src + '; return COURSE_DATA;')();
const patches = JSON.parse(fs.readFileSync(patchPath, 'utf8'));

let edits = 0, noteEdits = 0;
const errors = [];

for (const p of patches) {
  const topic = data.topics.find(t => t.id === p.topic);
  if (!topic) { errors.push(`topic ${p.topic} not found`); continue; }
  const item = topic.quiz[p.q - 1];
  if (!item) { errors.push(`t${p.topic} Q${p.q} not found`); continue; }

  const correctText = item.options[item.answer];

  for (const [oldText, newText] of Object.entries(p.opts)) {
    const idx = item.options.indexOf(oldText);
    if (idx === -1) { errors.push(`t${p.topic} Q${p.q}: option not found: "${oldText.slice(0, 50)}"`); continue; }
    if (idx === item.answer) { errors.push(`t${p.topic} Q${p.q}: REFUSED, that is the correct option`); continue; }
    if (item.options.includes(newText)) { errors.push(`t${p.topic} Q${p.q}: new text duplicates an existing option`); continue; }
    item.options[idx] = newText;
    edits++;
    // The note rewrite below is a blind string replace, which is only safe when
    // the option text is distinctive enough to appear in the note solely as a
    // quotation of that option. A one- or two-character option such as the SQL
    // operator "*" matches the note's own bold markers and punctuation, so
    // replacing it shreds the note. Rewrite the options and leave the note to a
    // human in that case.
    if (item.note && item.note.includes(oldText)) {
      if (oldText.length < 8) {
        errors.push(`t${p.topic} Q${p.q}: REFUSED note rewrite, option "${oldText}" is too short to string-replace safely; edit the note by hand`);
        continue;
      }
      item.note = item.note.split(oldText).join(newText);
      noteEdits++;
    }
  }

  // Trimming an over-written correct option is sometimes the honest fix: some
  // restored questions state the answer in 240 characters where 140 says the
  // same thing, and padding three distractors to match would just bloat every
  // option. Requires the explicit `correct` field so it can never happen by
  // accident, and the answer index must still point at the replacement.
  if (p.correct) {
    const before = item.answer;
    // A note's "**Correct:**" line quotes the correct option verbatim, so a
    // plain string replace would shorten the explanation along with the option.
    // `noteCorrect` decouples them: the option states the answer, the note keeps
    // (or expands on) the reasoning. Without it the old behaviour applies.
    const noteText = p.noteCorrect || p.correct;
    if (item.note && item.note.includes(correctText)) {
      item.note = item.note.split(correctText).join(noteText);
      noteEdits++;
    } else if (p.noteCorrect) {
      errors.push(`t${p.topic} Q${p.q}: noteCorrect given but note does not quote the correct option`);
    }
    item.options[item.answer] = p.correct;
    if (item.answer !== before) errors.push(`t${p.topic} Q${p.q}: FATAL, answer index moved`);
    edits++;
  } else if (item.options[item.answer] !== correctText) {
    errors.push(`t${p.topic} Q${p.q}: FATAL, correct option changed`);
  }
}

console.log(`option rewrites: ${edits}`);
console.log(`notes updated (verbatim quote replaced): ${noteEdits}`);
if (errors.length) {
  console.log(`\n${errors.length} problem(s):`);
  errors.forEach(e => console.log('  ' + e));
}
if (!dry && !errors.some(e => e.includes('FATAL'))) {
  fs.writeFileSync(dataPath, 'const COURSE_DATA = ' + JSON.stringify(data, null, 2) + ';\n');
  console.log(`\nwrote ${dataPath}`);
} else if (dry) {
  console.log('\ndry run, nothing written');
}
process.exitCode = errors.length ? 1 : 0;
