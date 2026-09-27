// Ported verbatim from machinelearning.js.org (~/Projects/github.io/machinelearning/lib/algorithms/decisionTree.js).
// Unchanged on purpose: the point of this demo is that the agent drives the original
// implementations, so divergence here would undermine it. Update upstream first.

// Decision Tree — ID3 algorithm (information gain, recursive splitting)
// Paper: Quinlan, J.R. (1986) "Induction of Decision Trees"
//   Machine Learning 1(1):81-106. https://link.springer.com/article/10.1007/BF00116251

// Step 1: Entropy H(S) = -Σ p_i log₂(p_i) over class distribution.
function entropy(instances, classIndex) {
  const counts = {};
  for (const inst of instances) {
    const c = inst[classIndex];
    if (c !== null) counts[c] = (counts[c] || 0) + 1;
  }
  const n = Object.values(counts).reduce((s, v) => s + v, 0);
  if (n === 0) return 0;
  return Object.values(counts).reduce((s, v) => {
    const p = v / n;
    return s - p * Math.log2(p);
  }, 0);
}

// Step 2: Information Gain = H(parent) - weighted H(children).
// Numeric attrs: binary split at the midpoint that maximises gain.
// Nominal attrs: multi-way split on all values.
function bestSplit(instances, attrIdx, attr, classIndex) {
  const parentH = entropy(instances, classIndex);
  const n = instances.length;

  if (attr.type === 'numeric') {
    const valid = instances.filter(i => i[attrIdx] !== null)
      .sort((a, b) => a[attrIdx] - b[attrIdx]);
    let bestGain = -Infinity, bestThreshold = null;
    for (let i = 0; i < valid.length - 1; i++) {
      if (valid[i][attrIdx] === valid[i + 1][attrIdx]) continue;
      const t = (valid[i][attrIdx] + valid[i + 1][attrIdx]) / 2;
      const left  = instances.filter(i => i[attrIdx] !== null && i[attrIdx] <= t);
      const right = instances.filter(i => i[attrIdx] === null || i[attrIdx] > t);
      const gain = parentH
        - (left.length / n)  * entropy(left,  classIndex)
        - (right.length / n) * entropy(right, classIndex);
      if (gain > bestGain) { bestGain = gain; bestThreshold = t; }
    }
    return { gain: bestGain, threshold: bestThreshold };
  }

  // Nominal: multi-way split
  const values = attr.values || [...new Set(instances.map(i => i[attrIdx]).filter(v => v !== null))];
  const gain = parentH - values.reduce((s, v) => {
    const sub = instances.filter(i => i[attrIdx] === v);
    return s + (sub.length / n) * entropy(sub, classIndex);
  }, 0);
  return { gain, threshold: null };
}

function majorityClass(instances, classIndex) {
  const counts = {};
  for (const inst of instances) {
    const c = inst[classIndex];
    if (c !== null) counts[c] = (counts[c] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

// Step 3: Recursive tree building.
// Stops when: pure node, depth limit reached, no gain, or ≤1 instance.
function buildTree(instances, attributes, classIndex, usedNominal, maxDepth, depth) {
  const pure = new Set(instances.map(i => i[classIndex]).filter(v => v !== null));
  if (pure.size <= 1 || depth >= maxDepth || instances.length <= 1) {
    return { leaf: true, value: majorityClass(instances, classIndex) };
  }

  let bestAttr = -1, bestGain = 0, bestThreshold = null;
  for (let i = 0; i < attributes.length; i++) {
    if (i === classIndex) continue;
    if (attributes[i].type !== 'numeric' && usedNominal.has(i)) continue;
    const { gain, threshold } = bestSplit(instances, i, attributes[i], classIndex);
    if (gain > bestGain) { bestGain = gain; bestAttr = i; bestThreshold = threshold; }
  }

  if (bestAttr === -1) return { leaf: true, value: majorityClass(instances, classIndex) };

  const attr = attributes[bestAttr];

  if (attr.type === 'numeric') {
    const left  = instances.filter(i => i[bestAttr] !== null && i[bestAttr] <= bestThreshold);
    const right = instances.filter(i => i[bestAttr] === null || i[bestAttr] > bestThreshold);
    return {
      leaf: false, attrIdx: bestAttr, attrName: attr.name, type: 'numeric',
      threshold: bestThreshold,
      children: {
        lte: buildTree(left,  attributes, classIndex, usedNominal, maxDepth, depth + 1),
        gt:  buildTree(right, attributes, classIndex, usedNominal, maxDepth, depth + 1),
      },
    };
  }

  // Nominal: multi-way split — mark attribute as used to prevent re-splitting
  const values = attr.values || [...new Set(instances.map(i => i[bestAttr]).filter(v => v !== null))];
  const newUsed = new Set(usedNominal).add(bestAttr);
  const fallback = majorityClass(instances, classIndex);
  const children = Object.fromEntries(
    values.map(v => {
      const sub = instances.filter(i => i[bestAttr] === v);
      return [v, sub.length
        ? buildTree(sub, attributes, classIndex, newUsed, maxDepth, depth + 1)
        : { leaf: true, value: fallback }];
    })
  );
  return { leaf: false, attrIdx: bestAttr, attrName: attr.name, type: 'nominal', children, fallback };
}

// Step 4: Traverse the learned tree to classify a new instance.
export function train(ds, maxDepth = 20) {
  const tree = buildTree(ds.instances, ds.attributes, ds.classIndex, new Set(), maxDepth, 0);
  return { tree, attributes: ds.attributes, classIndex: ds.classIndex };
}

export function classify(model, instance) {
  let node = model.tree;
  while (!node.leaf) {
    const val = instance[node.attrIdx];
    if (node.type === 'numeric') {
      node = (val !== null && val <= node.threshold) ? node.children.lte : node.children.gt;
    } else {
      node = node.children[val] ?? { leaf: true, value: node.fallback };
    }
  }
  return node.value;
}
