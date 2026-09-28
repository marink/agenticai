/**
 * Tool registry.
 *
 * Each entry is a plain JSON-Schema tool definition plus a handler, which is exactly an
 * MCP `tools/list` entry. The MCP server in `app/mcp/route.js` serves this array, and
 * the agent in `app/api/agent/route.js` reaches it only through that server, so there
 * is exactly one definition of what a tool is and what it does.
 *
 * The descriptions are written for the model, not for a human reader. They are
 * executable: a tool the model misunderstands is a tool it silently never calls,
 * or calls wrongly. That is why each one says when to use it and what it returns,
 * rather than just naming it.
 *
 * Every handler ends in an algorithm from machinelearning.js.org, a JavaScript
 * implementation of Weka — K2 structure learning, naive Bayes, k-NN, ID3 decision
 * trees, k-means — each citing its source paper in its header. The agent's job is to
 * decide WHICH to run and to read what comes back; the statistics underneath are not
 * the model's work.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parseARFF }                     from '@/lib/mlcore/parser.js';
import { attributeStats, classDistribution } from '@/lib/mlcore/stats.js';
import { stratifiedFolds, computeMetrics }   from '@/lib/mlcore/evaluation.js';
import { k2 }                            from '@/lib/mlcore/algorithms/k2.js';
import * as naiveBayes                   from '@/lib/mlcore/algorithms/naiveBayes.js';
import * as knn                          from '@/lib/mlcore/algorithms/knn.js';
import * as decisionTree                 from '@/lib/mlcore/algorithms/decisionTree.js';
import { searchDocs }                    from '@/lib/docs.js';

const DATASETS = {
  weather:          'Tiny classic (14 rows). Play tennis given outlook, temperature, humidity, wind. All nominal.',
  'contact-lenses': 'Small (24 rows). Which lens type to prescribe. All nominal — good for structure learning.',
  vote:             'US congressional voting records (435 rows, 17 nominal attributes). Party from votes.',
  iris:             'Fisher’s irises (150 rows). Numeric attributes — NOT suitable for K2 without discretising.',
  eczema:           'Synthetic eczema data (500 rows, 7 yes/no attributes), sampled from a known Bayesian network. All nominal.',
};

const CLASSIFIERS = { naiveBayes, knn, decisionTree };

async function loadDataset(name) {
  if (!(name in DATASETS)) throw new Error(`Unknown dataset "${name}". Call list_datasets first.`);
  const file = path.join(process.cwd(), 'public', 'datasets', `${name}.arff`);
  return parseARFF(await readFile(file, 'utf8'));
}

// Weka/ARFF convention: the class is the final attribute.
const classIndexOf = ds => ds.attributes.length - 1;

export const TOOLS = [
  {
    name: 'list_datasets',
    description:
      'List the datasets available in this environment, with a one-line description of each ' +
      'including how many rows it has and whether its attributes are nominal or numeric. ' +
      'Call this first if you have not been told which dataset to work on. Returns an object ' +
      'keyed by dataset name.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => DATASETS,
  },

  {
    name: 'describe_dataset',
    description:
      'Inspect one dataset before modelling it: attribute names, their types (nominal or numeric), ' +
      'the values each nominal attribute takes, the row count, and the class distribution. ' +
      'Use this to decide which algorithms are even applicable — K2 requires nominal attributes, ' +
      'so a dataset of numeric columns will need discretising or a different method.',
    inputSchema: {
      type: 'object',
      properties: { dataset: { type: 'string', description: 'Dataset name from list_datasets.' } },
      required: ['dataset'],
    },
    handler: async ({ dataset }) => {
      const ds = await loadDataset(dataset);
      return {
        rows: ds.instances.length,
        attributes: ds.attributes.map(a => ({
          name: a.name, type: a.type, values: a.values ?? null,
        })),
        classAttribute: ds.attributes[classIndexOf(ds)]?.name,
        classDistribution: classDistribution(ds),
        stats: attributeStats(ds),
      };
    },
  },

  {
    name: 'search_docs',
    description:
      'Search the datasets\' own documentation: where each dataset came from, the papers that used ' +
      'it, what its attributes mean, known rules and, for synthetic data, the structure it was ' +
      'generated from. Returns the best-matching passages, each with its source. Use it to check a ' +
      'finding against what is documented, and cite the source when you do. Keyword search: ask with ' +
      'the words the documentation would use.',
    inputSchema: {
      type: 'object',
      properties: {
        query:   { type: 'string', description: 'What to look for, in keywords.' },
        dataset: { type: 'string', description: 'Optional: only search this dataset\'s documentation.' },
        limit:   { type: 'integer', description: 'Passages to return (default 3, max 8).' },
      },
      required: ['query'],
    },
    handler: async ({ query, dataset = null, limit = 3 }) => {
      if (dataset && !(dataset in DATASETS)) throw new Error(`Unknown dataset "${dataset}". Call list_datasets first.`);
      const results = await searchDocs(query, { dataset, limit });
      return { query, results, ...(results.length ? {} : { note: 'No passage matched. Try other keywords.' }) };
    },
  },

  {
    name: 'learn_bayesian_structure',
    description:
      'Run the K2 algorithm to learn a Bayesian network structure from a dataset — which variables ' +
      'depend on which. K2 is a greedy search scored by the Cooper-Herskovits metric; it requires ' +
      'NOMINAL attributes and it is sensitive to the variable ordering you give it, because a node ' +
      'may only take parents from earlier in the order. Returns the edges found, the per-node log ' +
      'scores, and the total. Run it more than once with different orderings if you want to know how ' +
      'stable the structure is — that comparison is usually the interesting result, not any single run.',
    inputSchema: {
      type: 'object',
      properties: {
        dataset: { type: 'string', description: 'Dataset name.' },
        ordering: {
          type: 'array', items: { type: 'integer' },
          description: 'Optional variable ordering as attribute indices. Omit for natural order.',
        },
        maxParents: { type: 'integer', description: 'Maximum parents per node (default 3).' },
      },
      required: ['dataset'],
    },
    handler: async ({ dataset, ordering = null, maxParents = 3 }) => {
      const ds = await loadDataset(dataset);
      const { edges, scores } = k2(ds, ordering, maxParents);
      // k2() already returns edges as [{from, to, fromLabel, toLabel}] with indices
      // AND names. Pass the names through; the indices are noise to the model.
      const named = (edges ?? []).map(e => ({ from: e.fromLabel, to: e.toLabel }));
      const total = Object.values(scores ?? {}).reduce((a, b) => a + b, 0);
      return {
        edges: named,
        edgeCount: named.length,
        perNodeScores: Object.fromEntries(
          Object.entries(scores ?? {}).map(([i, s]) => [ds.attributes[i]?.name ?? i, s])),
        totalLogScore: total,
        ordering: ordering ?? 'natural',
        maxParents,
      };
    },
  },

  {
    name: 'evaluate_classifier',
    description:
      'Train a classifier and measure it with stratified k-fold cross-validation. Returns accuracy ' +
      'and a confusion matrix. Available: naiveBayes (fast, assumes independence), knn (instance-based, ' +
      'no training, k configurable), decisionTree (readable rules). Use this to test a claim rather ' +
      'than assert one — if you are about to say an algorithm suits a dataset, run it and report the number.',
    inputSchema: {
      type: 'object',
      properties: {
        dataset:   { type: 'string' },
        algorithm: { type: 'string', enum: Object.keys(CLASSIFIERS) },
        folds:     { type: 'integer', description: 'Default 10.' },
        k:         { type: 'integer', description: 'Neighbours, knn only. Default 1.' },
      },
      required: ['dataset', 'algorithm'],
    },
    handler: async ({ dataset, algorithm, folds = 10, k = 1 }) => {
      const impl = CLASSIFIERS[algorithm];
      if (!impl) throw new Error(`Unknown algorithm "${algorithm}".`);
      const ds = await loadDataset(dataset);
      const ci = classIndexOf(ds);
      const classValues = ds.attributes[ci]?.values ??
        [...new Set(ds.instances.map(r => r[ci]))];

      const preds = [], actuals = [];
      for (const { train: tr, test } of stratifiedFolds(ds, folds)) {
        const model = impl.train(tr);
        for (const row of test.instances) {
          preds.push(algorithm === 'knn' ? impl.classify(model, row, k) : impl.classify(model, row));
          actuals.push(row[ci]);
        }
      }
      const m = computeMetrics(preds, actuals, classValues);
      return { algorithm, dataset, folds, ...(algorithm === 'knn' ? { k } : {}), metrics: m };
    },
  },
];

/** MCP `tools/list` shape — no handlers, no server-only detail. */
export const toolManifest = () =>
  TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));

export async function runTool(name, input) {
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) throw new Error(`No such tool: ${name}`);
  return tool.handler(input ?? {});
}
