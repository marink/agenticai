'use client';
import { useEffect, useState } from 'react';
import {
  Box, Button, Container, Stack, TextField, Typography, Paper, Chip,
  CircularProgress, Alert, Divider, Link as MuiLink,
} from '@mui/material';

const EXAMPLES = [
  'Which variables actually drive the decision in contact-lenses? Check whether the structure holds if you reorder.',
  'Compare naive Bayes and k-NN on the vote dataset and tell me which to trust.',
  'Is the weather dataset big enough to support any conclusion at all?',
];

export default function Home() {
  const [goal, setGoal]   = useState(EXAMPLES[0]);
  const [busy, setBusy]   = useState(false);
  const [run, setRun]     = useState(null);
  const [error, setError] = useState(null);
  const [tools, setTools] = useState([]);

  useEffect(() => {
    fetch('/api/tools').then(r => r.json()).then(d => setTools(d.tools ?? [])).catch(() => {});
  }, []);

  async function go() {
    setBusy(true); setError(null); setRun(null);
    try {
      const r = await fetch('/api/agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });
      const d = await r.json();
      if (!r.ok) setError(d.error ?? 'Run failed.'); else setRun(d);
    } catch (e) { setError(String(e.message ?? e)); }
    finally { setBusy(false); }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={700}>An agent that runs real algorithms</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
        A Claude agent given tools over hand-written machine-learning implementations — K2 Bayesian
        structure learning, naive Bayes, k-nearest neighbours, decision trees. No modelling library
        underneath: the statistics are the algorithms themselves. The agent decides which to run,
        reads the results, and revises. Every tool call is shown below, with its arguments and what
        came back.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
        {tools.map(t => <Chip key={t.name} label={t.name} size="small" variant="outlined" />)}
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
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

      {run && (
        <Box sx={{ mt: 4 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <Chip size="small" label={`${run.trace.filter(t => t.kind === 'tool_call').length} tool calls`} />
            <Chip size="small" label={`${run.usage.input_tokens + run.usage.output_tokens} tokens`} />
            <Chip size="small" label={`$${run.costUsd}`} />
            <Chip size="small" label={run.stoppedBecause} />
          </Stack>
          {run.trace.map((e, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
              {e.kind === 'thought' ? (
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{e.text}</Typography>
              ) : (
                <>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip size="small" color={e.isError ? 'error' : 'primary'} label={e.tool} />
                    <Typography variant="caption" color="text.secondary">{e.ms} ms</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">arguments</Typography>
                  <Box component="pre" sx={{ m: 0, mb: 1, fontSize: 12, overflowX: 'auto' }}>
                    {JSON.stringify(e.input, null, 2)}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">returned</Typography>
                  <Box component="pre" sx={{ m: 0, fontSize: 12, maxHeight: 320, overflow: 'auto' }}>
                    {JSON.stringify(e.output, null, 2)}
                  </Box>
                </>
              )}
            </Paper>
          ))}
        </Box>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 6 }}>
        The algorithms come from{' '}
        <MuiLink href="https://machinelearning.js.org">machinelearning.js.org</MuiLink>, a browser
        implementation of Weka; the Bayesian-network work behind K2 is at{' '}
        <MuiLink href="https://probabilistic.net">probabilistic.net</MuiLink>. The{' '}
        <MuiLink href="/api/tools">tool manifest</MuiLink> shows exactly what the agent was handed.
      </Typography>
    </Container>
  );
}
