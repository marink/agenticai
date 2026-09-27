// Ported verbatim from machinelearning.js.org (~/Projects/github.io/machinelearning/lib/stats.js).
// Unchanged on purpose: this artifact's claim is that an agent drives Marin's OWN
// implementations, so divergence here would undermine the point. Update upstream first.

// Descriptive statistics for a parsed dataset

export function attributeStats(ds) {
  return ds.attributes.map((attr, i) => {
    const vals = ds.instances.map(inst => inst[i]).filter(v => v !== null && v !== undefined);
    const missing = ds.instances.length - vals.length;

    if (attr.type === 'numeric') {
      const sorted = [...vals].sort((a, b) => a - b);
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
      return {
        name: attr.name,
        type: 'numeric',
        count: vals.length,
        missing,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: +mean.toFixed(4),
        stddev: +Math.sqrt(variance).toFixed(4),
        median: sorted[Math.floor(sorted.length / 2)],
        distinct: new Set(vals).size,
      };
    } else {
      const freq = {};
      for (const v of vals) freq[v] = (freq[v] || 0) + 1;
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      return {
        name: attr.name,
        type: 'nominal',
        count: vals.length,
        missing,
        distinct: sorted.length,
        freq,
        mode: sorted[0]?.[0],
      };
    }
  });
}

export function classDistribution(ds) {
  const ci = ds.classIndex;
  if (ci < 0 || ds.attributes[ci]?.type !== 'nominal') return null;
  const freq = {};
  for (const inst of ds.instances) {
    const v = inst[ci];
    if (v !== null) freq[v] = (freq[v] || 0) + 1;
  }
  return freq;
}

export function histogramBins(values, numBins = 20) {
  const nums = values.filter(v => v !== null);
  if (!nums.length) return [];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (min === max) return [{ x: min, count: nums.length }];
  const width = (max - min) / numBins;
  const bins = Array.from({ length: numBins }, (_, i) => ({
    x: +(min + i * width + width / 2).toFixed(3),
    label: `${+(min + i * width).toFixed(2)}–${+(min + (i + 1) * width).toFixed(2)}`,
    count: 0,
  }));
  for (const v of nums) {
    const idx = Math.min(Math.floor((v - min) / width), numBins - 1);
    bins[idx].count++;
  }
  return bins;
}
