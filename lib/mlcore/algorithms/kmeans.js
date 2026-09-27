// Ported verbatim from machinelearning.js.org (~/Projects/github.io/machinelearning/lib/algorithms/kmeans.js).
// Unchanged on purpose: the point of this demo is that the agent drives the original
// implementations, so divergence here would undermine it. Update upstream first.

// k-Means clustering (SimpleKMeans equivalent) — Lloyd's algorithm
// Paper: MacQueen (1967) "Some Methods for Classification and Analysis of Multivariate Observations"
//   Proc. 5th Berkeley Symp. Math. Stat. Prob. Free: https://projecteuclid.org/euclid.bsmsp/1200512992

function numericAttrs(attributes, classIndex) {
  return attributes.map((a, i) => i !== classIndex && a.type === 'numeric' ? i : -1).filter(i => i >= 0);
}

function centroidDist(a, b, idxs) {
  return Math.sqrt(idxs.reduce((s, i) => {
    const av = a[i] ?? 0, bv = b[i] ?? 0;
    return s + (av - bv) ** 2;
  }, 0));
}

// Update step: recompute each centroid as the mean of its assigned instances.
// Empty cluster fallback: reassign to a random instance to avoid degenerate solutions.
function updateCentroids(instances, assignments, k, idxs) {
  return Array.from({ length: k }, (_, ki) => {
    const members = instances.filter((_, j) => assignments[j] === ki);
    if (!members.length) return instances[Math.floor(Math.random() * instances.length)];
    return idxs.map(i => members.reduce((s, m) => s + (m[i] ?? 0), 0) / members.length);
  });
}

// cluster() implements Lloyd's algorithm:
//   1. Random init  2. Assignment + update loop  3. WCSS calculation
export function cluster(ds, k = 3, maxIter = 100) {
  const { instances, attributes, classIndex } = ds;
  const idxs = numericAttrs(attributes, classIndex);
  if (!idxs.length) throw new Error('No numeric attributes for clustering');

  // initialise centroids by picking k random distinct instances
  const shuffled = [...instances].sort(() => Math.random() - 0.5);
  let centroids = shuffled.slice(0, k).map(inst => idxs.map(i => inst[i] ?? 0));

  let assignments = new Array(instances.length).fill(0);
  let iterations = 0;

  for (let iter = 0; iter < maxIter; iter++) {
    iterations++;
    const projected = instances.map(inst => idxs.map(i => inst[i] ?? 0));
    const newAssign = projected.map(p => {
      let best = 0, bestD = Infinity;
      for (let ki = 0; ki < k; ki++) {
        const d = centroidDist(p, centroids[ki], idxs.map((_, j) => j));
        if (d < bestD) { bestD = d; best = ki; }
      }
      return best;
    });

    const changed = newAssign.some((a, i) => a !== assignments[i]);
    assignments = newAssign;
    if (!changed) break;
    centroids = updateCentroids(projected, assignments, k, idxs.map((_, j) => j));
  }

  // within-cluster sum of squares
  const projected = instances.map(inst => idxs.map(i => inst[i] ?? 0));
  const wcss = projected.reduce((s, p, j) => {
    return s + idxs.reduce((s2, _, ii) => s2 + (p[ii] - centroids[assignments[j]][ii]) ** 2, 0);
  }, 0);

  // cluster sizes
  const sizes = Array.from({ length: k }, (_, ki) => assignments.filter(a => a === ki).length);

  return { assignments, centroids, wcss: +wcss.toFixed(4), iterations, sizes, attrIndices: idxs, attrNames: idxs.map(i => attributes[i].name) };
}
