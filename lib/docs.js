/**
 * Retrieval over the datasets' own documentation.
 *
 * Every ARFF file here opens with a `%` comment header: where the data came from, the
 * papers that used it, what the attributes mean and, for synthetic data, the structure
 * it was generated from. That header is the corpus. It is split into its numbered
 * sections ("1. Title", "2. Sources", ...) so a result is a passage, not a whole file,
 * and ranked with BM25 (Robertson & Zaragoza, 2009, "The Probabilistic Relevance
 * Framework: BM25 and Beyond").
 *
 * Keyword ranking is the right size for a corpus of a few dozen passages. A larger one
 * would want embeddings; this one would only be padded by them.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'public', 'datasets');
const STOP = new Set('a an and are as at be by for from has have in is it its of on or that the this to was were which with'.split(' '));

const tokenize = s => (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(t => !STOP.has(t));

// A top-level heading is "% 3. Past Usage": one space at most after the %. Nested
// numbered lists in these headers are indented further, so they stay in their section.
const HEADING = /^%\s?(\d+)\.\s+(.*)$/;

function sections(dataset, text) {
  const lines = text.split('\n').filter(l => l.startsWith('%'));
  const out = [];
  let cur = null;
  for (const line of lines) {
    const h = HEADING.exec(line);
    if (h || !cur) {
      cur = { dataset, section: h ? `${h[1]}. ${h[2].replace(/:$/, '').split(':')[0].trim()}` : 'Header', lines: [] };
      out.push(cur);
    }
    cur.lines.push(line.replace(/^%\s?/, ''));
  }
  return out
    .map(s => ({ dataset: s.dataset, section: s.section, text: s.lines.join('\n').trim() }))
    .filter(s => s.text);
}

let index = null;

async function buildIndex() {
  const files = (await readdir(DIR)).filter(f => f.endsWith('.arff'));
  const passages = [];
  for (const f of files) passages.push(...sections(f.replace(/\.arff$/, ''), await readFile(path.join(DIR, f), 'utf8')));

  const docs = passages.map(p => {
    const tokens = tokenize(`${p.section} ${p.text}`);
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { ...p, tf, len: tokens.length };
  });
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const avgLen = docs.reduce((a, d) => a + d.len, 0) / (docs.length || 1);
  return { docs, df, avgLen };
}

/** BM25 (k1 = 1.2, b = 0.75) over the documentation passages, optionally for one dataset. */
export async function searchDocs(query, { dataset = null, limit = 3 } = {}) {
  index ??= await buildIndex();
  const { docs, df, avgLen } = index;
  const N = docs.length, k1 = 1.2, b = 0.75;
  const terms = [...new Set(tokenize(query))];

  return docs
    .filter(d => !dataset || d.dataset === dataset)
    .map(d => {
      let score = 0;
      for (const t of terms) {
        const f = d.tf.get(t);
        if (!f) continue;
        const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
        score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d.len / avgLen));
      }
      return { source: `${d.dataset}.arff § ${d.section}`, score: Number(score.toFixed(3)), text: d.text };
    })
    .filter(r => r.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, Math.max(1, Math.min(limit, 8)));
}
