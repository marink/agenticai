import Anthropic from '@anthropic-ai/sdk';
import { anthropicTools, runTool } from '@/lib/tools/registry.js';
import { checkCap, estimateUsd, store, LIMITS } from '@/lib/cap.js';

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-5';

const SYSTEM = `You are a data-analysis agent with tools that run real machine-learning
algorithms — K2 Bayesian structure learning, naive Bayes, k-nearest neighbours and decision
trees — all hand-written implementations, not library calls.

Work like an analyst, not a search engine:

- Look before you model. Inspect a dataset's attribute types before choosing a method; K2
  needs nominal attributes and will produce nothing useful on numeric ones.
- Test claims instead of asserting them. If you are about to say an algorithm suits this
  data, run it and quote the number.
- When a result depends on an arbitrary choice — K2's variable ordering is the obvious case —
  vary it and report whether the answer held. A structure that survives reordering means
  something; one that does not is an artefact of the order.
- Say what you are uncertain about. Small datasets support weak conclusions and it is more
  useful to say so than to round up.

Finish with a short plain-English answer to what was actually asked. No preamble.`;

function clientIp(req) {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const goal = String(body?.goal ?? '').slice(0, 500).trim();
  if (!goal) return Response.json({ error: 'A goal is required.' }, { status: 400 });

  const gate = await checkCap(clientIp(req));
  if (!gate.ok) {
    return Response.json({ error: gate.message, reason: gate.reason, recordedAvailable: true },
                         { status: gate.status });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const tools = anthropicTools();
  const messages = [{ role: 'user', content: goal }];

  // The trace IS the artifact. Every model turn and every tool call is recorded in
  // order so the page can show what the agent actually did, not a summary of it.
  const trace = [];
  let usage = { input_tokens: 0, output_tokens: 0 };
  let stoppedBecause = 'completed';

  for (let step = 0; step < LIMITS.maxSteps; step++) {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: LIMITS.maxTokensPerRun,
      system: SYSTEM,
      tools,
      messages,
    });

    usage.input_tokens  += res.usage?.input_tokens  ?? 0;
    usage.output_tokens += res.usage?.output_tokens ?? 0;

    for (const block of res.content) {
      if (block.type === 'text' && block.text.trim()) {
        trace.push({ kind: 'thought', step, text: block.text });
      }
    }

    const calls = res.content.filter(b => b.type === 'tool_use');
    if (!calls.length) {
      messages.push({ role: 'assistant', content: res.content });
      break;
    }

    messages.push({ role: 'assistant', content: res.content });

    const results = [];
    for (const call of calls) {
      const started = Date.now();
      let result, isError = false;
      try {
        result = await runTool(call.name, call.input);
      } catch (e) {
        result = { error: String(e.message ?? e) };
        isError = true;
      }
      trace.push({
        kind: 'tool_call', step, tool: call.name, input: call.input,
        output: result, isError, ms: Date.now() - started,
      });
      results.push({
        type: 'tool_result', tool_use_id: call.id,
        content: JSON.stringify(result).slice(0, 20000),
        ...(isError ? { is_error: true } : {}),
      });
    }
    messages.push({ role: 'user', content: results });

    if (step === LIMITS.maxSteps - 1) stoppedBecause = 'step_ceiling';
  }

  const usd = estimateUsd(usage);
  await store.addSpend(usd);

  return Response.json({
    goal, trace, usage,
    costUsd: Number(usd.toFixed(4)),
    stoppedBecause,
    limits: { maxSteps: LIMITS.maxSteps, maxTokensPerRun: LIMITS.maxTokensPerRun },
  });
}
