'use client';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Container, Link as MuiLink, Paper, Stack,
  TextField, Typography,
} from '@mui/material';

const EXAMPLES = [
  'Which variables actually drive the decision in contact-lenses? Check whether the structure holds if you reorder.',
  'Compare naive Bayes and k-NN on the vote dataset and tell me which to trust.',
  'Is the weather dataset big enough to support any conclusion at all?',
];

// The paper behind each method, as cited in the implementation's own header.
const SOURCES = [
  { method: 'K2', authors: 'Cooper & Herskovits', year: 1992,
    title: 'A Bayesian Method for the Induction of Probabilistic Networks from Data', venue: 'Machine Learning 9(4)' },
  { method: 'Naive Bayes', authors: 'John & Langley', year: 1995,
    title: 'Estimating Continuous Distributions in Bayesian Classifiers', venue: 'UAI-95',
    href: 'https://arxiv.org/abs/1302.4964' },
  { method: 'k-nearest neighbours', authors: 'Cover & Hart', year: 1967,
    title: 'Nearest Neighbor Pattern Classification', venue: 'IEEE Trans. Information Theory 13(1)',
    href: 'https://doi.org/10.1109/TIT.1967.1053964' },
  { method: 'Decision tree (ID3)', authors: 'Quinlan', year: 1986,
    title: 'Induction of Decision Trees', venue: 'Machine Learning 1(1)',
    href: 'https://link.springer.com/article/10.1007/BF00116251' },
  { method: 'BM25 (documentation search)', authors: 'Robertson & Zaragoza', year: 2009,
    title: 'The Probabilistic Relevance Framework: BM25 and Beyond', venue: 'Foundations and Trends in Information Retrieval 3(4)' },
];

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const inWords = n => WORDS[n] ?? String(n);

export default function Showcase({ recorded, tools, live, connect, limits }) {
  const orderings = recorded.trace.filter(e => e.tool === 'learn_bayesian_structure').length;
  const cost = `$${recorded.costUsd.toFixed(2)}`;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h4" component="h1" fontWeight={700}>An agent that runs real algorithms</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
        A Claude agent given tools over classic machine-learning algorithms — K2 Bayesian structure
        learning, naive Bayes, k-nearest neighbours, decision trees — following Weka and the papers
        that introduced them. It decides which to
        run, reads the results, and revises. The window shows a recorded run, replayed step by step.
      </Typography>

      <Box sx={{
        mt: { xs: 3, md: 4 },
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
        gap: { xs: 4, md: 5 },
      }}>
        <Box sx={{ order: { xs: 2, md: 1 } }}>
          <Section title="It decides what to run">
            The agent gets a goal in plain English and {inWords(tools.length)} tools. Nothing tells it
            which tool to call or in what order. Its instructions describe how an analyst works — look
            at the data first, test a claim instead of asserting it, say what is uncertain — and the
            rest is the model's own choice. It reaches the tools over MCP: it asks this app's MCP server
            what tools exist (<code>tools/list</code>) and runs each one through it
            (<code>tools/call</code>), as any other MCP client could &mdash; the server is open to
            outside clients too, by invitation, so ask if you would like to point your own at it.
            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {tools.map(t => (
                <Box key={t.name}>
                  <Box component="code" sx={{ fontSize: 13, fontWeight: 600 }}>{t.name}</Box>
                  <Typography variant="body2" color="text.secondary">{firstSentence(t.description)}</Typography>
                </Box>
              ))}
            </Stack>
          </Section>

          <Section title="It checks its own work">
            K2 learns the structure of a Bayesian network, but its answer depends on the order the
            variables are given in, so the agent varies the order: {inWords(orderings)} orderings in
            this run. It also searches the dataset's documentation, which records the network the data
            was generated from, and grades its result against it. With causes ordered before effects,
            K2 recovered that network edge for edge; a shuffled order added links that are not in it,
            and the agent said so.
          </Section>

          <Section title="And it got one thing wrong">
            In the shuffled run the agent says the true DustMiteExposure &rarr; Th2Dysregulation edge
            was &ldquo;impossible given that ordering&rdquo;. That is not right, and the run itself
            shows why: the ordering was HighSugarDiet, IrritantProducts, GeneticRisk,
            DustMiteExposure, EczemaFlare, BrokenSkinBarrier, Th2Dysregulation. K2 may take parents
            only from earlier in the order, and DustMiteExposure comes fourth while Th2Dysregulation
            comes last &mdash; so that edge was available. K2 scored EczemaFlare, HighSugarDiet and
            GeneticRisk higher and did not choose it. The agent attributed to a structural constraint
            what was really a scoring outcome. Its numbers and comparisons are correct; this one
            explanation is not. The replay is left as it ran rather than re-recorded, because what an
            agent actually said is more useful than a clean take.
          </Section>

          <Section title="It says how sure it is">
            The finding is cross-checked against naive Bayes and a decision tree under 10-fold
            cross-validation, and the answer ends with its limits: the edge directions came from the
            ordering it was given rather than from the data, and fewer than half of the actual flares
            are predicted.
          </Section>

          <Section title="Where the algorithms come from">
            The implementations come from{' '}
            <MuiLink href="https://machinelearning.js.org">machinelearning.js.org</MuiLink>, a browser
            implementation of Weka, and follow the papers that introduced each method. The
            Bayesian-network work behind K2 is at{' '}
            <MuiLink href="https://probabilistic.net">probabilistic.net</MuiLink>.
            <Box component="ul" sx={{ mt: 1.5, mb: 0, pl: 2.5, '& li': { mb: 0.75, fontSize: 14 } }}>
              {SOURCES.map(s => (
                <li key={s.method}>
                  <strong>{s.method}</strong>: {s.authors} ({s.year}),{' '}
                  {s.href ? <MuiLink href={s.href}>{s.title}</MuiLink> : <em>{s.title}</em>}, {s.venue}.
                </li>
              ))}
            </Box>
          </Section>

          <Section title="It runs on a budget">
            Each model turn is capped at {limits.maxTokensPerRun.toLocaleString()} tokens and each run
            at {inWords(limits.maxSteps)} rounds of tool calls, with daily and monthly spend ceilings
            behind them. The run shown here cost {cost}.
            {!live && <> To try it live, contact the author.</>}
          </Section>
        </Box>

        <Box sx={{ order: { xs: 1, md: 2 }, position: { md: 'sticky' }, top: { md: 24 }, alignSelf: 'start' }}>
          <Replay run={recorded} />
        </Box>
      </Box>

      {live && <LiveRunner connect={connect} />}
    </Container>
  );
}

function Section({ title, children }) {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Typography variant="h6" component="h2" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
      <Typography component="div" color="text.secondary" sx={{ lineHeight: 1.65 }}>{children}</Typography>
    </Box>
  );
}

function firstSentence(s) {
  const m = /^.*?[.!?](\s|$)/.exec(s);
  return (m ? m[0] : s).trim();
}

/* ---------- The replay: a recorded run, played back like a screen recording ---------- */

const TOOL_RUNNING_MS = 450;
const TOOL_SETTLE_MS  = 300;
const TYPE_CHARS      = 7;
const TYPE_MS         = 16;
const HOLD_AT_END_MS  = 8000;

// Every frame of the playback, computed once. A frame says which event is on screen and
// how far along it is; everything before it is shown in full.
function buildTimeline(trace) {
  const frames = [{ i: -1, delay: 900 }];
  trace.forEach((e, i) => {
    if (e.kind !== 'thought') {
      frames.push({ i, running: true, delay: TOOL_RUNNING_MS });
      frames.push({ i, delay: TOOL_SETTLE_MS });
    } else {
      for (let c = TYPE_CHARS; c < e.text.length; c += TYPE_CHARS) frames.push({ i, chars: c, delay: TYPE_MS });
      frames.push({ i, delay: 400 });
    }
  });
  frames.push({ i: trace.length, delay: HOLD_AT_END_MS });
  return frames;
}

function Replay({ run }) {
  const timeline = useMemo(() => buildTimeline(run.trace), [run]);
  const last = timeline.length - 1;
  const [f, setF] = useState(last);          // server render and no-JS: the whole run
  const [playing, setPlaying] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const frameRef = useRef(null);
  const bodyRef = useRef(null);
  const stick = useRef(true);

  // Start playing once the page is live, unless the reader has asked for less motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setF(0); setPlaying(true);
  }, []);

  // Don't animate what nobody can see.
  useEffect(() => {
    const io = new IntersectionObserver(([en]) => setOnScreen(en.isIntersecting));
    io.observe(frameRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !onScreen) return;
    const t = setTimeout(() => {
      if (f >= last) { stick.current = true; if (bodyRef.current) bodyRef.current.scrollTop = 0; setF(0); }
      else setF(f + 1);
    }, timeline[f].delay);
    return () => clearTimeout(t);
  }, [f, playing, onScreen, last, timeline]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el && stick.current && playing) el.scrollTop = el.scrollHeight;
  }, [f, playing]);

  const frame = timeline[f];
  const shown = run.trace.slice(0, Math.max(0, Math.min(frame.i + 1, run.trace.length)));
  const toolCalls = run.trace.filter(e => e.kind === 'tool_call').length;
  const tokens = run.usage.input_tokens + run.usage.output_tokens;

  return (
    <Box ref={frameRef}>
      <Window
        title="agent — recorded run"
        badge={`${formatDate(run.recordedAt)} · ${run.model}`}
        bodyRef={bodyRef}
        onScroll={e => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40; }}
        footer={
          <>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 0 }}>
              {toolCalls} tool calls · {tokens.toLocaleString()} tokens · ${run.costUsd.toFixed(2)}
            </Typography>
            {playing
              ? <Button size="small" onClick={() => setPlaying(false)}>Pause</Button>
              : <Button size="small" onClick={() => { if (f >= last) setF(0); setPlaying(true); }}>Play</Button>}
            <Button size="small" onClick={() => { setPlaying(false); setF(last); }}>Show all</Button>
          </>
        }
      >
        <Goal text={run.goal} />
        {shown.map((e, idx) => {
          const current = idx === frame.i;
          return <TraceEvent key={idx} e={e} running={current && frame.running}
            chars={current ? frame.chars : null} />;
        })}
        {f === 0 && playing && <Typography variant="caption" color="text.secondary">thinking…</Typography>}
      </Window>
    </Box>
  );
}

function formatDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/* ---------- Window chrome and trace pieces, shared by the replay and live runs ---------- */

function Window({ title, badge, children, footer, bodyRef, onScroll, height }) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" spacing={1.5}
        sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Stack direction="row" spacing={0.75} aria-hidden>
          {[0, 1, 2].map(i => <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'text.disabled', opacity: 0.5 }} />)}
        </Stack>
        <Typography variant="caption" fontWeight={600} sx={{ flex: 1, minWidth: 0 }} noWrap>{title}</Typography>
        {badge && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>{badge}</Typography>}
      </Stack>
      <Box ref={bodyRef} onScroll={onScroll}
        sx={{ p: 2, overflowY: 'auto', height: height ?? { xs: 460, md: 'min(640px, calc(100vh - 150px))' } }}>
        {children}
      </Box>
      {footer && (
        <Stack direction="row" alignItems="center" spacing={1}
          sx={{ px: 1.5, py: 0.5, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
          {footer}
        </Stack>
      )}
    </Paper>
  );
}

function TraceEvent({ e, running = false, chars = null }) {
  if (e.kind === 'mcp') return <McpConnect e={e} running={running} />;
  if (e.kind === 'tool_call') return <ToolCall e={e} running={running} />;
  return <Thought text={chars != null ? e.text.slice(0, chars) : e.text} />;
}

// The agent's first move: connect to the MCP server and ask what tools it has.
function McpConnect({ e, running }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline"
      sx={{ mb: 1, fontSize: 13, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
      <Box component="span" sx={{ width: 14, flexShrink: 0, color: 'success.main' }}>
        {running ? <CircularProgress size={10} thickness={6} /> : '⇄'}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box component="span" sx={{ fontWeight: 600, color: 'secondary.main' }}>MCP</Box>
        <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>connect {e.server} · tools/list</Box>
        <Box sx={{ color: 'text.secondary', mt: 0.25 }}>
          {running ? 'connecting…' : <>→ {e.tools.length} tools: {e.tools.join(', ')}</>}
        </Box>
      </Box>
    </Stack>
  );
}

function Goal({ text }) {
  return (
    <Box sx={{ mb: 2, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}>
      <Typography variant="caption" color="text.secondary">goal</Typography>
      <Typography variant="body2" fontWeight={600}>{text}</Typography>
    </Box>
  );
}

function ToolCall({ e, running }) {
  const args = Object.entries(e.input ?? {}).map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join(' · ');
  return (
    <Box component="details" sx={{ mb: 1, fontSize: 13, '& > summary': { listStyle: 'none', cursor: 'pointer' },
      '& > summary::-webkit-details-marker': { display: 'none' } }}>
      <Box component="summary">
        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
          <Box component="span" sx={{ width: 14, flexShrink: 0, color: e.isError ? 'error.main' : 'success.main' }}>
            {running ? <CircularProgress size={10} thickness={6} /> : e.isError ? '✕' : '✓'}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{e.tool}</Box>
            {args && <Box component="span" sx={{ color: 'text.secondary', ml: 1, wordBreak: 'break-word' }}>{args}</Box>}
            <Box sx={{ color: 'text.secondary', mt: 0.25 }}>
              {running ? 'running…' : <>→ {summarize(e)}</>}
            </Box>
          </Box>
          {!running && <Box component="span" sx={{ color: 'text.disabled', fontSize: 12, flexShrink: 0 }}>{e.ms} ms</Box>}
        </Stack>
      </Box>
      {!running && (
        <Box component="pre" sx={{ m: 0, mt: 1, ml: 3, p: 1, fontSize: 12, maxHeight: 280, overflow: 'auto',
          bgcolor: 'action.hover', borderRadius: 1 }}>
          {JSON.stringify(e.output, null, 2)}
        </Box>
      )}
    </Box>
  );
}

// One line per tool result, the way a person would read it off the output.
function summarize(e) {
  const o = e.output ?? {};
  if (e.isError) return o.error ?? 'error';
  switch (e.tool) {
    case 'list_datasets':
      return `${Object.keys(o).length} datasets`;
    case 'describe_dataset': {
      const dist = o.classDistribution ? ' (' + Object.entries(o.classDistribution).map(([k, v]) => `${k} ${v}`).join(', ') + ')' : '';
      return `${o.rows} rows · ${o.attributes?.length ?? '?'} attributes · class ${o.classAttribute}${dist}`;
    }
    case 'search_docs':
      return o.results?.length
        ? `${o.results.length} passage${o.results.length > 1 ? 's' : ''} · top: ${o.results[0].source}`
        : 'nothing matched';
    case 'learn_bayesian_structure':
      return (o.edges?.length ? o.edges.map(x => `${x.from} → ${x.to}`).join(', ') : 'no edges')
        + (o.totalLogScore != null ? ` · log score ${o.totalLogScore.toFixed(1)}` : '');
    case 'evaluate_classifier': {
      const m = o.metrics ?? {};
      return `accuracy ${Math.round((m.accuracy ?? 0) * 100)}% (${m.correct}/${m.total})`
        + (m.kappa != null ? ` · κ ${m.kappa.toFixed(2)}` : '');
    }
    default: {
      const s = JSON.stringify(o);
      return s.length > 90 ? s.slice(0, 90) + '…' : s;
    }
  }
}

function Thought({ text }) {
  return <Box sx={{ my: 1.5, fontSize: 14, lineHeight: 1.6 }}><Markdown text={text} /></Box>;
}

// Just enough Markdown for what the model writes here: headings, lists, bold, italics, code.
function Markdown({ text }) {
  return text.split(/\n{2,}/).map((block, i) => {
    const h = /^(#{1,4})\s+(.*)$/s.exec(block);
    if (h) return <Typography key={i} component="h3" fontWeight={700} sx={{ mt: 2, mb: 0.5, fontSize: 15 }}><Inline s={h[2]} /></Typography>;
    const lines = block.split('\n');
    if (lines.every(l => /^\s*[-*]\s+/.test(l))) {
      return <Box key={i} component="ul" sx={{ my: 1, pl: 2.5 }}>{lines.map((l, j) => <li key={j}><Inline s={l.replace(/^\s*[-*]\s+/, '')} /></li>)}</Box>;
    }
    return <Box key={i} component="p" sx={{ my: 1 }}><Inline s={lines.join(' ')} /></Box>;
  });
}

function Inline({ s }) {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g).map((part, i) => {
    if (/^\*\*.+\*\*$/.test(part)) return <strong key={i}><Inline s={part.slice(2, -2)} /></strong>;
    if (/^`.+`$/.test(part)) return <Box key={i} component="code" sx={{ fontSize: '0.92em', px: 0.5, borderRadius: 0.5, bgcolor: 'action.hover' }}>{part.slice(1, -1)}</Box>;
    if (/^\*.+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/* ---------- Live runs: only rendered for someone who arrived by an invite link ---------- */

function LiveRunner({ connect }) {
  const [goal, setGoal]   = useState(EXAMPLES[1]);
  const [busy, setBusy]   = useState(false);
  const [run, setRun]     = useState(null);
  const [error, setError] = useState(null);

  async function go() {
    setBusy(true); setError(null); setRun(null);
    try {
      const r = await fetch('/api/agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });
      if (r.status === 404) { setError('Live runs are not available right now.'); return; }
      const d = await r.json();
      if (!r.ok) setError(d.error ?? 'Run failed.'); else setRun(d);
    } catch (e) { setError(String(e.message ?? e)); }
    finally { setBusy(false); }
  }

  return (
    <Box component="section" sx={{ mt: { xs: 2, md: 6 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h5" component="h2" fontWeight={700}>Try it live</Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 760 }}>
        This runs the real agent against the same tools. A run usually takes under a minute.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <TextField fullWidth multiline minRows={2} value={goal}
          onChange={e => setGoal(e.target.value)} label="Ask it something" />
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button variant="contained" onClick={go} disabled={busy || !goal.trim()}>
            {busy ? <CircularProgress size={20} /> : 'Run it'}
          </Button>
          {EXAMPLES.map((ex, i) => (
            <Button key={i} size="small" onClick={() => setGoal(ex)}>Example {i + 1}</Button>
          ))}
        </Stack>
      </Paper>

      {error && <Alert severity="info" sx={{ mt: 3 }}>{error}</Alert>}

      {connect && <ConnectYourAgent {...connect} />}

      {run && (
        <Box sx={{ mt: 3 }}>
          <Window
            title="agent — live run"
            badge={`${run.trace.filter(t => t.kind === 'tool_call').length} tool calls · ${(run.usage.input_tokens + run.usage.output_tokens).toLocaleString()} tokens · $${run.costUsd}`}
            height="auto"
          >
            <Goal text={run.goal} />
            {run.trace.map((e, i) => <TraceEvent key={i} e={e} />)}
            {run.stoppedBecause !== 'completed' && (
              <Alert severity="warning" sx={{ mt: 2 }}>Stopped early: {run.stoppedBecause.replace('_', ' ')}.</Alert>
            )}
          </Window>
        </Box>
      )}
    </Box>
  );
}

// The same MCP server the agent uses, reachable from the visitor's own MCP client.
function ConnectYourAgent({ url, token }) {
  const [copied, setCopied] = useState(false);
  const command = `claude mcp add --transport http agenticai ${url} --header "Authorization: Bearer ${token}"`;
  async function copy() {
    try { await navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* clipboard blocked: the command is still selectable */ }
  }
  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
      <Typography fontWeight={700}>Use the tools from your own agent</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
        The agent above reaches its tools through this app's MCP server. Any MCP client can connect
        to the same server; in Claude Code:
      </Typography>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box component="pre" sx={{ m: 0, p: 1.25, flex: 1, minWidth: 0, fontSize: 12, bgcolor: 'action.hover',
          borderRadius: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{command}</Box>
        <Button size="small" variant="outlined" onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
      </Stack>
    </Paper>
  );
}
