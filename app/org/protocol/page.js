import { Box, Container, Typography, Divider, Paper } from '@mui/material';
import Link from 'next/link';
import Code from '../../../components/Code';

export const metadata = {
  title: 'The protocol — eight gates',
  description:
    'The mechanical half of The Agentic AI Organization: addressing, immutable message files, the '
    + 'freshness predicate, pull delivery, the authorization conjunction, refusal with routing, '
    + 'read-back verification and the durability boundary.',
};

const P = ({ children }) => (
  <Typography paragraph sx={{ lineHeight: 1.85, fontSize: '1.05rem' }}>{children}</Typography>
);
const H = ({ children }) => (
  <Typography variant="h5" sx={{ mt: 6, mb: 2, fontWeight: 700, lineHeight: 1.25 }}>{children}</Typography>
);
const Note = ({ children }) => (
  <Paper variant="outlined" sx={{ p: 2.5, my: 3, bgcolor: 'action.hover' }}>
    <Typography sx={{ lineHeight: 1.75, fontSize: '0.98rem' }}>{children}</Typography>
  </Paper>
);
const Figure = ({ children, caption }) => (
  <Box sx={{ my: 4 }}>
    <Box sx={{ width: '100%', color: 'text.primary' }}>{children}</Box>
    {caption && (
      <Typography sx={{ fontSize: 13, opacity: 0.7, mt: 1.5, textAlign: 'center' }}>
        {caption}
      </Typography>
    )}
  </Box>
);

const Gate = ({ n, title, children }) => (
  <Box sx={{ my: 3.5 }}>
    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 0.75 }}>
      {n}. {title}
    </Typography>
    <Typography sx={{ lineHeight: 1.85, fontSize: '1.05rem' }}>{children}</Typography>
  </Box>
);

export default function Protocol() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>

      <Typography sx={{ mb: 2, fontSize: 14 }}>
        <Link href="/org" style={{ color: 'inherit' }}>&larr; The Agentic AI Organization</Link>
      </Typography>

      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.15 }}>
        The protocol
      </Typography>
      <Typography sx={{ fontSize: '1.2rem', mb: 1, opacity: 0.85 }}>
        Eight gates, the shape of a message, and the one conjunction most systems leave out.
      </Typography>
      <Divider sx={{ my: 4 }} />

      <H>The shape of it</H>
      <P>
        Every agent has an address. Every address has a directory. A message is a file in that
        directory that is never written twice. Nothing is pushed, nothing is scheduled, and nothing
        acts without a human saying so.
      </P>

      <Figure caption="Agents never write to each other — every exchange goes through the store. The command path is separate and direct: the human addresses each agent, and nothing acts without that.">
        <Box component="svg" viewBox="0 0 720 320" sx={{ width: '100%', height: 'auto' }}
             role="img" aria-label="A shared store on the left feeds three agents; the human on the right addresses each agent directly">
          <defs>
            <marker id="ar" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="currentColor" opacity="0.55" />
            </marker>
            <marker id="arT" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="currentColor" opacity="0.8" />
            </marker>
          </defs>

          {/* store */}
          <rect x="24" y="112" width="166" height="84" rx="10"
                fill="none" stroke="currentColor" strokeWidth="2" opacity="0.85" />
          <text x="107" y="146" textAnchor="middle" fill="currentColor" fontSize="15" fontWeight="600">shared store</text>
          <text x="107" y="167" textAnchor="middle" fill="currentColor" fontSize="11.5" opacity="0.65">one directory</text>
          <text x="107" y="183" textAnchor="middle" fill="currentColor" fontSize="11.5" opacity="0.65">per address</text>

          {/* agents */}
          {[
            { y: 20,  label: 'agent A' },
            { y: 132, label: 'agent B' },
            { y: 244, label: 'agent C' },
          ].map((a) => (
            <g key={a.label}>
              <rect x="280" y={a.y} width="160" height="56" rx="8"
                    fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.75" />
              <text x="360" y={a.y + 34} textAnchor="middle" fill="currentColor" fontSize="14">{a.label}</text>
            </g>
          ))}

          {/* human */}
          <rect x="530" y="126" width="160" height="68" rx="10"
                fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" opacity="0.95" />
          <text x="610" y="155" textAnchor="middle" fill="currentColor" fontSize="15" fontWeight="600">human</text>
          <text x="610" y="175" textAnchor="middle" fill="currentColor" fontSize="11.5" opacity="0.7">tasks, and the gate</text>

          {/* store to agents — messages, both ways */}
          <g stroke="currentColor" strokeWidth="1.6" opacity="0.55" fill="none" markerEnd="url(#ar)">
            <path d="M190,138 C230,120 240,60 276,48" />
            <path d="M190,154 C230,156 240,158 276,160" />
            <path d="M190,172 C230,192 240,256 276,272" />
          </g>
          <g stroke="currentColor" strokeWidth="1.6" opacity="0.35" fill="none" strokeDasharray="2 5">
            <path d="M276,56 C240,70 230,126 190,144" />
            <path d="M276,280 C240,250 230,190 190,180" />
          </g>
          <text x="233" y="86" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.6">messages</text>

          {/* human to each agent — tasks, direct */}
          <g stroke="currentColor" strokeWidth="1.8" opacity="0.8" fill="none"
             strokeDasharray="6 4" markerEnd="url(#arT)">
            <path d="M530,146 C494,120 478,60 444,48" />
            <path d="M530,160 C500,160 480,160 444,160" />
            <path d="M530,176 C494,200 478,256 444,272" />
          </g>
          <text x="487" y="86" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.7">tasks</text>
        </Box>
      </Figure>

      <H>A message</H>
      <P>
        There is no schema server and no envelope format to agree on. A message is a text file whose
        name is a timestamp and a random suffix, so two writers can never choose the same one.
      </P>

      <Code mode="message" caption="to-<address>/2026-10-20T14-19-22-490Z-918ca4f4.md — the name is the ordering and the collision avoidance.">{`---
from: agent-a
to: agent-b
subject: short line that says what this is
sent: 2026-10-20T14:19:22.490Z
---

The body is prose, written for the recipient rather than for a parser.
State what is known, what is assumed, and what is being asked.

Reply with content, not status.`}</Code>

      <P>
        Reading the queue is a directory listing. Draining it moves each file into{' '}
        <code>read/</code>, which is the acknowledgement &mdash; there is no separate ack message and
        no flag to update, because updating a flag is the thing that goes wrong.
      </P>

      <Code>{`$ queue due agent-b          # cheap predicate, exit 0 means look
  DUE - to-agent-b last checked 1211 min ago, 2 unread

$ queue drain agent-b        # read, then move to read/
  2 message(s) read and moved to read/

$ queue send agent-c "subject" body.md --from agent-b
  sent agent-b -> agent-c
  to-agent-c/2026-10-20T16-07-04-327Z-33ceb5a8.md
  5231 bytes  sha256 9b8674d9...  verified: YES`}</Code>

      <P>
        That last line is the seventh gate doing its job. The send call returned success before it
        printed; <i>verified</i> means the origin was read back and compared.
      </P>

      <H>The eight gates</H>

      <Gate n="1" title="An address is a role, not a host">
        Mail goes to a name that says what an agent is for, never where it runs. Move the agent to
        another machine and every reference still resolves. This looks like pedantry right up until
        the first migration.
      </Gate>

      <Gate n="2" title="One immutable file per message">
        Not a shared document, not a row with an updated-at column &mdash; a directory, one file per
        message, named by timestamp. Nothing is ever written twice, so concurrent writers cannot
        collide and the last one to save cannot quietly win. What it replaces is a status board
        edited in place by several people, which drifts, and which records nothing about having
        drifted.
      </Gate>

      <Gate n="3" title="Freshness is a predicate, not a timer">
        A cheap function answers &ldquo;should I look?&rdquo; with an exit code, and the expensive
        operation runs only when the cheap one says yes. Nothing polls.
      </Gate>

      <Gate n="4" title="Pull, not push">
        No scheduler and no hooks. The demand is a request arriving from outside the system. That
        bounds the cost, and more importantly it keeps an agent from acting while nobody is
        watching. An agent that wakes on a timer is an agent whose mistakes are found later than
        they are made.
      </Gate>

      <Gate n="5" title="Receipt is not authorization">
        The important one, and the one most systems leave out. Reading a message does not license
        acting on it; the agent reports what is open and a human chooses. The gate is a conjunction
        &mdash; delivered <i>and</i> authorized &mdash; and anything implementing only the first
        half has built an autonomous actor by accident while believing it built a messenger.
      </Gate>

      <Gate n="6" title="Refusal carries routing">
        An agent may decline a task and name a better address for it. A negative acknowledgement
        with a redirect in it costs nothing and prevents a specific rot: an agent whose name has
        drifted from its work accumulates context that makes it worse at both.
      </Gate>

      <Gate n="7" title="Verify by reading back, not by status">
        The transport returns success. Success is not evidence. Read the origin and compare. A sync
        client can report healthy for days while moving nothing in either direction &mdash; the
        status is true about the client and false about the world. Every status is a claim about a
        subsystem, and the subsystem is not the thing you care about.
      </Gate>

      <Gate n="8" title="The durability boundary is explicit">
        Working context is volatile and lossy; committed state is the record. &ldquo;What is not
        committed did not happen&rdquo; is not encouragement. It is where the system&rsquo;s memory
        begins, and it is why an agent reports content rather than status &mdash; status describes a
        session, content outlives one.
      </Gate>

      <H>What they compose into</H>
      <P>
        An action is permitted when it is <b>delivered and authorized and verified</b>. Most of the
        interesting failures are systems that implement one term and assume the rest.
      </P>

      <Figure caption="Three terms, in series. Drop any one and the system still appears to work, which is the problem.">
        <Box component="svg" viewBox="0 0 720 200" sx={{ width: '100%', height: 'auto' }}
             role="img" aria-label="Delivered AND authorized AND verified, with the failure mode for dropping each term">
          <g stroke="currentColor" fill="none">
            {[
              { x: 30,  t: 'DELIVERED',  s: 'message exists' },
              { x: 250, t: 'AUTHORIZED', s: 'a human chose' },
              { x: 470, t: 'VERIFIED',   s: 'origin read back' },
            ].map((b) => (
              <g key={b.t}>
                <rect x={b.x} y="40" width="170" height="64" rx="8" strokeWidth="1.8" opacity="0.8" />
                <text x={b.x + 85} y="68" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="700" stroke="none">{b.t}</text>
                <text x={b.x + 85} y="88" textAnchor="middle" fill="currentColor" fontSize="11.5" opacity="0.7" stroke="none">{b.s}</text>
              </g>
            ))}
            <g strokeWidth="1.8" opacity="0.6" markerEnd="url(#ar2)">
              <path d="M200,72 L246,72" />
              <path d="M420,72 L466,72" />
              <path d="M640,72 L690,72" />
            </g>
          </g>
          <defs>
            <marker id="ar2" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="currentColor" opacity="0.6" />
            </marker>
          </defs>
          <text x="700" y="76" textAnchor="end" fill="currentColor" fontSize="13" fontWeight="700">act</text>

          <text x="115" y="140" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.65">drop this</text>
          <text x="115" y="158" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.65">and nothing arrives</text>
          <text x="335" y="140" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.65">drop this and you have</text>
          <text x="335" y="158" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.65">an autonomous actor</text>
          <text x="555" y="140" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.65">drop this and you trust</text>
          <text x="555" y="158" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.65">a status instead of a fact</text>
        </Box>
      </Figure>

      <Note>
        None of these primitives are new. This is at-least-once delivery, explicit acknowledgement,
        idempotent writes and read-after-write verification &mdash; understood for decades, and
        taught. The claim is not that I invented anything. It is that an organisation of people runs
        the same protocol with none of the terms made explicit, and that the failures look identical
        once you draw them as message flow instead of as personalities.
      </Note>

      <Divider sx={{ my: 5 }} />
      <Typography sx={{ fontSize: 14, opacity: 0.7 }}>
        <Link href="/org" style={{ color: 'inherit' }}>&larr; back to the paper</Link>
      </Typography>
    </Container>
  );
}
