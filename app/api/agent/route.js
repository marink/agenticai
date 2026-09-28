import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { checkCap, estimateUsd, store, LIMITS } from '@/lib/cap.js';
import { currentInvite, hidden } from '@/lib/invite.js';

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-5';

const SYSTEM = `You are a data-analysis agent with tools that run real machine-learning
algorithms — K2 Bayesian structure learning, naive Bayes, k-nearest neighbours and decision
trees — implementations that follow Weka and the papers that introduced each method.

Work like an analyst, not a search engine:

- Look before you model. Inspect a dataset's attribute types before choosing a method; K2
  needs nominal attributes and will produce nothing useful on numeric ones.
- Test claims instead of asserting them. If you are about to say an algorithm suits this
  data, run it and quote the number.
- When a result depends on an arbitrary choice — K2's variable ordering is the obvious case —
  vary it and report whether the answer held. A structure that survives reordering means
  something; one that does not is an artefact of the order.
- Check findings against the documentation when it exists. A dataset's header can record
  known rules or, for synthetic data, the true structure; compare what you found with it,
  and cite the source.
- Say what you are uncertain about. Small datasets support weak conclusions and it is more
  useful to say so than to round up.

Finish with a short plain-English answer to what was actually asked: 250 words at most, no
preamble. Every number you quote must appear in a tool result above, and every comparison
("best", "worst") must hold across all the runs you made.`;

function clientIp(req) {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
}

export async function POST(req) {
  const invite = await currentInvite();
  if (!invite) return hidden();

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const goal = String(body?.goal ?? '').slice(0, 500).trim();
  if (!goal) return Response.json({ error: 'A goal is required.' }, { status: 400 });

  const gate = await checkCap(clientIp(req));
  if (!gate.ok) {
    return Response.json({ error: gate.message, reason: gate.reason, recordedAvailable: true },
                         { status: gate.status });
  }

  console.log(`live run: ${invite}`);

  // The agent is an MCP client of this app's own MCP server (app/mcp). It learns its tools
  // from tools/list and runs them with tools/call, the same way any outside MCP client
  // would. The visitor's invite cookie goes along, so the server admits it like any
  // invited caller; nothing else is needed.
  const mcpUrl = new URL('/mcp', req.url);
  const mcp = new Client({ name: 'agenticai-agent', version: '0.1.0' });
  try {
    await mcp.connect(new StreamableHTTPClientTransport(mcpUrl, {
      requestInit: { headers: { cookie: req.headers.get('cookie') ?? '' } },
    }));
  } catch (e) {
    console.error('mcp connect failed:', e);
    return Response.json({ error: 'The tool server could not be reached. Try again shortly.' }, { status: 502 });
  }

  try {
    return await runAgent({ goal, mcp, mcpUrl });
  } finally {
    await mcp.close().catch(() => {});
  }
}

async function runAgent({ goal, mcp, mcpUrl }) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const listed = (await mcp.listTools()).tools;
  const tools = listed.map(t => ({ name: t.name, description: t.description, input_schema: t.inputSchema }));
  const messages = [{ role: 'user', content: goal }];

  // The trace IS the artifact. Every model turn and every tool call is recorded in
  // order so the page can show what the agent actually did, not a summary of it.
  const trace = [{ kind: 'mcp', server: mcpUrl.pathname, tools: listed.map(t => t.name) }];
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
        const r = await mcp.callTool({ name: call.name, arguments: call.input });
        const text = r.content?.find(c => c.type === 'text')?.text ?? '';
        isError = Boolean(r.isError);
        try { result = JSON.parse(text); } catch { result = isError ? { error: text } : text; }
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
