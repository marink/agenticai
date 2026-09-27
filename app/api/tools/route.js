import { toolManifest, runTool } from '@/lib/tools/registry.js';

export const runtime = 'nodejs';

// GET: the same tool definitions the model is handed, in MCP `tools/list` shape.
// Public on purpose -- the point is that you can see the surface the agent was
// given, not just what it said afterwards.
export async function GET() {
  return Response.json({ tools: toolManifest() });
}

// POST: run one tool directly, without the agent. No model call, so no cost and
// no cap -- the statistics are just code. Useful for checking that the numbers
// the agent reports are the numbers the algorithms actually produce.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { tool, input } = body ?? {};
  if (!tool) return Response.json({ error: 'Field "tool" is required.' }, { status: 400 });
  try {
    const started = Date.now();
    const output = await runTool(tool, input ?? {});
    return Response.json({ tool, input: input ?? {}, output, ms: Date.now() - started });
  } catch (e) {
    return Response.json({ tool, error: String(e.message ?? e) }, { status: 400 });
  }
}
