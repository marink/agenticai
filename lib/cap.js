/**
 * Spend cap for the live agent.
 *
 * The demo is public and unauthenticated to READ. Live runs spend real money,
 * so they are bounded three ways, in descending order of how reliable each one is:
 *
 *  1. Per-run token ceiling   - passed to the API as max_tokens. Hard, enforced
 *                               by the provider, cannot be exceeded. Trustworthy.
 *  2. Per-run step ceiling    - the agent loop stops after N tool round-trips.
 *                               Hard, enforced in this process. Trustworthy.
 *  3. Daily spend ceiling     - needs shared state across serverless instances.
 *                               The in-memory store below is BEST-EFFORT ONLY:
 *                               each Vercel instance keeps its own counter, so
 *                               the real ceiling is (instances x limit).
 *
 * (3) is the honest weak point. Before this takes real traffic it wants a shared
 * store - Vercel KV or Upstash - behind the same interface. It is written as a
 * swappable `store` for exactly that reason, rather than pretending the in-memory
 * version is sufficient.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const LIMITS = {
  maxTokensPerRun: Number(process.env.AGENT_MAX_TOKENS_PER_RUN ?? 4000),
  maxSteps:        Number(process.env.AGENT_MAX_STEPS ?? 8),
  dailyUsdCeiling: Number(process.env.AGENT_DAILY_USD_CEILING ?? 2.0),
  perIpRunsPerHour: Number(process.env.AGENT_RUNS_PER_IP_PER_HOUR ?? 5),
};

// Swap this for a KV-backed implementation; the interface is deliberately tiny.
function createMemoryStore() {
  const spend = new Map();   // dayKey -> usd
  const runs  = new Map();   // ip -> timestamps[]
  return {
    async addSpend(usd) {
      const k = new Date().toISOString().slice(0, 10);
      const next = (spend.get(k) ?? 0) + usd;
      spend.set(k, next);
      return next;
    },
    async getSpend() {
      return spend.get(new Date().toISOString().slice(0, 10)) ?? 0;
    },
    async noteRun(ip) {
      const now = Date.now();
      const kept = (runs.get(ip) ?? []).filter(t => now - t < 60 * 60 * 1000);
      kept.push(now);
      runs.set(ip, kept);
      return kept.length;
    },
  };
}

export const store = createMemoryStore();

/** Decide whether a live run may proceed. Returns {ok} or {ok:false, reason, status}. */
export async function checkCap(ip) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, status: 503, reason: 'no_api_key',
             message: 'Live runs are not configured on this deployment. The recorded run still works.' };
  }
  const spent = await store.getSpend();
  if (spent >= LIMITS.dailyUsdCeiling) {
    return { ok: false, status: 429, reason: 'daily_ceiling',
             message: `The demo's daily budget ($${LIMITS.dailyUsdCeiling.toFixed(2)}) is spent. Recorded runs still work; it resets at midnight UTC.` };
  }
  const recent = await store.noteRun(ip);
  if (recent > LIMITS.perIpRunsPerHour) {
    return { ok: false, status: 429, reason: 'per_ip',
             message: `That's ${LIMITS.perIpRunsPerHour} live runs in an hour from this address. Recorded runs are unlimited.` };
  }
  return { ok: true };
}

/** Claude Sonnet pricing, USD per million tokens. Update if the rate card moves. */
const PRICE = { inPerM: 3.0, outPerM: 15.0 };

export function estimateUsd({ input_tokens = 0, output_tokens = 0 }) {
  return (input_tokens / 1e6) * PRICE.inPerM + (output_tokens / 1e6) * PRICE.outPerM;
}
