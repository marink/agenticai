// Ported verbatim from machinelearning.js.org (~/Projects/github.io/machinelearning/lib/algorithms/naiveBayes.js).
// Unchanged on purpose: this artifact's claim is that an agent drives Marin's OWN
// implementations, so divergence here would undermine the point. Update upstream first.

// Naïve Bayes: Gaussian for numeric attrs, Laplace-smoothed multinomial for nominal
// Paper: John & Langley (1995) "Estimating Continuous Distributions in Bayesian Classifiers"
//   UAI-95. Free PDF: https://arxiv.org/abs/1302.4964

// train() computes:
//   priors[cv]         = P(class=cv) — MLE frequency estimate
//   likelihoods[cv][i] = {mean, variance} for numeric  |  {counts, total} for nominal
export function train(ds) {
  const { attributes, instances, classIndex } = ds;
  const classAttr = attributes[classIndex];
  const classValues = classAttr.values || [...new Set(instances.map(i => i[classIndex]).filter(v => v !== null))];

  const priors = {};
  const likelihoods = {}; // likelihoods[classVal][attrIdx] = {mean,variance} or {counts,total}

  for (const cv of classValues) {
    const subset = instances.filter(i => i[classIndex] === cv);
    priors[cv] = subset.length / instances.length;
    likelihoods[cv] = {};

    for (let i = 0; i < attributes.length; i++) {
      if (i === classIndex) continue;
      const vals = subset.map(inst => inst[i]).filter(v => v !== null);

      if (attributes[i].type === 'numeric') {
        const mean = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
        const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length || 1) || 1e-9;
        likelihoods[cv][i] = { mean, variance };
      } else {
        const attrVals = attributes[i].values || [];
        const counts = {};
        for (const v of attrVals) counts[v] = 1; // Laplace smoothing
        for (const v of vals) counts[v] = (counts[v] || 1) + 1;
        likelihoods[cv][i] = { counts, total: vals.length + attrVals.length };
      }
    }
  }

  return { priors, likelihoods, classValues, attributes, classIndex };
}

// Log-Gaussian density (John & Langley §3): log P(x | μ, σ²).
// Log-space prevents floating-point underflow when multiplying many small probabilities.
function gaussianLog(x, mean, variance) {
  return -0.5 * Math.log(2 * Math.PI * variance) - ((x - mean) ** 2) / (2 * variance);
}

// classify() computes log P(class) + Σ log P(xᵢ | class) for each class and returns argmax.
export function classify(model, instance) {
  const { priors, likelihoods, classValues, attributes, classIndex } = model;
  let best = null, bestScore = -Infinity;

  for (const cv of classValues) {
    let logP = Math.log(priors[cv]);
    for (let i = 0; i < attributes.length; i++) {
      if (i === classIndex || instance[i] === null) continue;
      const lk = likelihoods[cv][i];
      if (!lk) continue;
      if (attributes[i].type === 'numeric') {
        logP += gaussianLog(instance[i], lk.mean, lk.variance);
      } else {
        logP += Math.log((lk.counts[instance[i]] || 1) / lk.total);
      }
    }
    if (logP > bestScore) { bestScore = logP; best = cv; }
  }

  return best;
}
