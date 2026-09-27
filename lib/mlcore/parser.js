// Ported verbatim from machinelearning.js.org (~/Projects/github.io/machinelearning/lib/parser.js).
// Unchanged on purpose: the point of this demo is that the agent drives the original
// implementations, so divergence here would undermine it. Update upstream first.

// Parses ARFF and CSV into a unified dataset object:
// { relation, attributes: [{name, type, values?}], instances: [][], classIndex }

function csvSplit(line) {
  const out = [];
  let cur = '', inQ = false, q = null;
  for (const c of line) {
    if (inQ) { if (c === q) inQ = false; else cur += c; }
    else if (c === "'" || c === '"') { inQ = true; q = c; }
    else if (c === ',') { out.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseAttrDef(str) {
  let name, rest;
  if (str[0] === "'" || str[0] === '"') {
    const end = str.indexOf(str[0], 1);
    name = str.slice(1, end);
    rest = str.slice(end + 1).trim();
  } else {
    const sp = str.search(/\s/);
    if (sp === -1) return null;
    name = str.slice(0, sp);
    rest = str.slice(sp + 1).trim();
  }
  const up = rest.toUpperCase();
  if (up.startsWith('REAL') || up.startsWith('NUMERIC') || up.startsWith('INTEGER')) {
    return { name, type: 'numeric' };
  }
  if (rest.startsWith('{')) {
    const values = rest.slice(1, rest.indexOf('}')).split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    return { name, type: 'nominal', values };
  }
  return { name, type: 'string' };
}

export function parseARFF(text) {
  const ds = { relation: 'unknown', attributes: [], instances: [], classIndex: -1 };
  let inData = false;

  for (let raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('%')) continue;

    if (!inData) {
      const up = line.toUpperCase();
      if (up.startsWith('@RELATION')) {
        ds.relation = line.slice(9).trim().replace(/^['"]|['"]$/g, '');
      } else if (up.startsWith('@ATTRIBUTE')) {
        const attr = parseAttrDef(line.slice(10).trim());
        if (attr) ds.attributes.push(attr);
      } else if (up.startsWith('@DATA')) {
        inData = true;
      }
    } else {
      if (line.startsWith('{')) continue;
      const raw2 = csvSplit(line);
      if (raw2.length !== ds.attributes.length) continue;
      const inst = raw2.map((v, i) => {
        if (v === '?' || v === '') return null;
        return ds.attributes[i].type === 'numeric' ? parseFloat(v) : v;
      });
      ds.instances.push(inst);
    }
  }

  ds.classIndex = ds.attributes.length - 1;
  return ds;
}

export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV needs at least a header and one data row');

  const headers = csvSplit(lines[0]);

  // infer types from first data row
  const sample = csvSplit(lines[1]);
  const attributes = headers.map((name, i) => {
    const v = sample[i]?.trim();
    return { name: name.trim(), type: v !== undefined && !isNaN(parseFloat(v)) && v !== '' ? 'numeric' : 'nominal' };
  });

  // for nominal attrs collect values
  const valueSets = attributes.map(() => new Set());
  const instances = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = csvSplit(lines[i]);
    if (parts.length !== attributes.length) continue;
    const inst = parts.map((v, j) => {
      const val = v.trim();
      if (val === '' || val === '?') return null;
      if (attributes[j].type === 'numeric') return parseFloat(val);
      valueSets[j].add(val);
      return val;
    });
    instances.push(inst);
  }

  attributes.forEach((attr, i) => {
    if (attr.type === 'nominal') attr.values = [...valueSets[i]].sort();
  });

  return { relation: 'dataset', attributes, instances, classIndex: attributes.length - 1 };
}

export function autoparse(text, filename = '') {
  if (filename.toLowerCase().endsWith('.arff') || text.trimStart().startsWith('@')) {
    return parseARFF(text);
  }
  return parseCSV(text);
}
