// Ported verbatim from machinelearning.js.org (~/Projects/github.io/machinelearning/lib/evaluation.js).
// Unchanged on purpose: the point of this demo is that the agent drives the original
// implementations, so divergence here would undermine it. Update upstream first.

// Train/test splitting and evaluation metrics

export function percentageSplit(ds, pct = 66) {
  const n = ds.instances.length;
  const trainN = Math.round(n * pct / 100);
  const shuffled = [...ds.instances].sort(() => Math.random() - 0.5);
  return {
    train: { ...ds, instances: shuffled.slice(0, trainN) },
    test:  { ...ds, instances: shuffled.slice(trainN) },
  };
}

export function stratifiedFolds(ds, k = 10) {
  const byClass = {};
  for (const inst of ds.instances) {
    const c = inst[ds.classIndex];
    if (!byClass[c]) byClass[c] = [];
    byClass[c].push(inst);
  }

  // shuffle within each class
  for (const arr of Object.values(byClass)) arr.sort(() => Math.random() - 0.5);

  const folds = Array.from({ length: k }, () => []);
  for (const arr of Object.values(byClass)) {
    arr.forEach((inst, i) => folds[i % k].push(inst));
  }

  return folds.map((_, fi) => ({
    train: { ...ds, instances: folds.flatMap((f, i) => i !== fi ? f : []) },
    test:  { ...ds, instances: folds[fi] },
  }));
}

export function computeMetrics(predictions, actuals, classValues) {
  const n = predictions.length;
  let correct = 0;
  const matrix = {};
  for (const c of classValues) {
    matrix[c] = {};
    for (const c2 of classValues) matrix[c][c2] = 0;
  }

  for (let i = 0; i < n; i++) {
    const pred = predictions[i], act = actuals[i];
    if (pred === act) correct++;
    if (matrix[act] && matrix[act][pred] !== undefined) matrix[act][pred]++;
    else if (matrix[act]) matrix[act][pred] = (matrix[act][pred] || 0) + 1;
  }

  const accuracy = correct / n;

  // per-class precision, recall, f1
  const perClass = {};
  for (const c of classValues) {
    const tp = matrix[c]?.[c] || 0;
    const fp = classValues.reduce((s, r) => s + (r !== c ? (matrix[r]?.[c] || 0) : 0), 0);
    const fn = classValues.reduce((s, r) => s + (r !== c ? 0 : classValues.reduce((s2, p) => s2 + (p !== c ? (matrix[c]?.[p] || 0) : 0), 0)), 0);
    const precDenom = tp + fp;
    const recallDenom = tp + fn;
    const prec = precDenom ? tp / precDenom : 0;
    const recall = recallDenom ? tp / recallDenom : 0;
    perClass[c] = {
      tp, fp, fn,
      precision: +prec.toFixed(4),
      recall: +recall.toFixed(4),
      f1: prec + recall > 0 ? +(2 * prec * recall / (prec + recall)).toFixed(4) : 0,
    };
  }

  // kappa
  const po = accuracy;
  const pe = classValues.reduce((s, c) => {
    const actualC = actuals.filter(a => a === c).length / n;
    const predC = predictions.filter(p => p === c).length / n;
    return s + actualC * predC;
  }, 0);
  const kappa = pe < 1 ? +(((po - pe) / (1 - pe)).toFixed(4)) : 1;

  return { accuracy: +accuracy.toFixed(4), correct, total: n, matrix, perClass, kappa };
}

export function formatResults(metrics, classValues, algorithmName, testMode) {
  const pct = (metrics.accuracy * 100).toFixed(2);
  const wrong = metrics.total - metrics.correct;

  let out = `=== Run information ===\n`;
  out += `Classifier: ${algorithmName}\n`;
  out += `Test mode:  ${testMode}\n\n`;

  out += `=== Summary ===\n\n`;
  out += `Correctly Classified Instances   ${String(metrics.correct).padStart(6)}   ${pct} %\n`;
  out += `Incorrectly Classified Instances ${String(wrong).padStart(6)}   ${(100 - parseFloat(pct)).toFixed(2)} %\n`;
  out += `Kappa statistic                  ${String(metrics.kappa).padStart(8)}\n`;
  out += `Total Number of Instances        ${String(metrics.total).padStart(6)}\n\n`;

  out += `=== Detailed Accuracy By Class ===\n\n`;
  out += `${'TP Rate'.padStart(8)} ${'FP Rate'.padStart(8)} ${'Precision'.padStart(10)} ${'Recall'.padStart(8)} ${'F-Measure'.padStart(10)}   Class\n`;
  for (const c of classValues) {
    const p = metrics.perClass[c];
    out += `${String(p.recall).padStart(8)} ${String(p.fp/(metrics.total||1)|0 === 0 ? '0' : (p.fp/metrics.total).toFixed(4)).padStart(8)} ${String(p.precision).padStart(10)} ${String(p.recall).padStart(8)} ${String(p.f1).padStart(10)}   ${c}\n`;
  }

  out += `\n=== Confusion Matrix ===\n\n`;
  const labels = classValues.map((_, i) => String.fromCharCode(97 + i));
  const colW = 6;
  out += labels.map(l => l.padStart(colW)).join('') + '     <-- classified as\n';
  for (let i = 0; i < classValues.length; i++) {
    const row = classValues.map(pred => String(metrics.matrix[classValues[i]]?.[pred] || 0).padStart(colW)).join('');
    out += `${row}   | ${labels[i]} = ${classValues[i]}\n`;
  }

  return out;
}
