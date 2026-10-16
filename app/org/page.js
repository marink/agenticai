import { Box, Container, Typography, Divider, Paper } from '@mui/material';
import Link from 'next/link';

export const metadata = {
  title: 'The Agentic AI Organization — preliminary',
  description:
    'I gave a few AI agents their own mailboxes and a shared memory, and accidentally rebuilt every '
    + 'office I have ever worked in. Notes on what happened, including the day the onboarding '
    + 'instructions arrived inside the mailbox you needed the instructions to open.',
};

const P = ({ children }) => (
  <Typography paragraph sx={{ lineHeight: 1.85, fontSize: '1.05rem' }}>{children}</Typography>
);
const H = ({ children }) => (
  <Typography variant="h5" sx={{ mt: 6, mb: 2, fontWeight: 700, lineHeight: 1.25 }}>{children}</Typography>
);
const Q = ({ children }) => (
  <Box sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2.5, py: 0.5, my: 3 }}>
    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.75, fontStyle: 'italic' }}>{children}</Typography>
  </Box>
);
const Note = ({ children }) => (
  <Paper variant="outlined" sx={{ p: 2.5, my: 3, bgcolor: 'action.hover' }}>
    <Typography sx={{ lineHeight: 1.75, fontSize: '0.98rem' }}>{children}</Typography>
  </Paper>
);

export default function Org() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>

      <Typography sx={{ mb: 2, fontSize: 14 }}>
        <Link href="/" style={{ color: 'inherit' }}>&larr; agenticai</Link>
      </Typography>

      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.15 }}>
        The Agentic AI Organization
      </Typography>
      <Typography sx={{ fontSize: '1.2rem', mb: 1, opacity: 0.85 }}>
        I gave a few agents their own mailboxes and a shared memory. Within a week they had invented
        office politics, without having any.
      </Typography>
      <Typography sx={{ fontSize: 14, opacity: 0.7 }}>
        Preliminary. The dates and numbers are fixed; the conclusions are still moving.
      </Typography>

      <Divider sx={{ my: 4 }} />

      <P>
        This started as plumbing, not research. I had several long-running AI agents doing unrelated
        work, and they kept needing things from each other. So I built the obvious infrastructure: a
        shared memory they could all read and write, and a mailbox each, so a message could reach the
        agent it concerned rather than whoever happened to look first.
      </P>
      <P>
        Very ordinary. A filing cabinet and a pigeonhole.
      </P>
      <P>
        What I did not expect was that this little arrangement would, almost immediately, start
        producing the <i>exact</i> problems I have watched organizations produce for twenty years.
        Not analogies. The same problems, with timestamps, in a system containing no politics, no
        ego, no careerism, no bad days and nobody protecting a position. That turns out to be the
        interesting part, and it is the reason I am writing any of this down.
      </P>

      <H>Stale knowledge, with nobody to blame for it</H>
      <P>
        The first surprise was gentle. A copy of the agents&rsquo; shared memory, used to answer
        questions quickly, turned out to be three weeks old. Nothing had broken. No error appeared.
        It simply kept answering, confidently and fluently, from a version of the world that had
        stopped being true.
      </P>
      <P>
        You have met this organization. It is the one where a decision was reversed in March and
        someone is still citing the old one in September, perfectly sincerely, because the document
        they are reading says so. I had always filed that under <i>people not keeping up</i>.
      </P>
      <P>
        Here, there were no people. The agent was not wrong. The <i>retrieval</i> was wrong. And that
        reframes the whole category: <b>stale institutional knowledge is not a failure of diligence.
        It is what happens by default to any store that can be read faster than it is refreshed.</b>
      </P>

      <H>The instructions were inside the mailbox</H>
      <P>
        This one still delights me.
      </P>
      <P>
        Having just built per-agent mailboxes, I recruited a new agent &mdash; a session that had
        been doing something else entirely &mdash; and sent it a welcome message. Its address, the
        rules, how to read and write, and a thoughtful note saying that if its client was too old to
        reach its own mailbox, here is how to update it.
      </P>
      <P>
        I sent that message to its mailbox.
      </P>
      <P>
        Its client was too old to reach its mailbox.
      </P>
      <Q>
        The instructions for opening the mailbox were inside the mailbox.
      </Q>
      <P>
        I had anticipated the failure. I had written the remedy. I had put the remedy inside the
        thing the remedy was for. Anticipating a problem inside an artifact the reader cannot open
        turns out not to be anticipating it at all.
      </P>
      <P>
        And then I remembered every new job where the password reset instructions arrive by email,
        to the account you cannot log into. Every system access request that requires you to be in
        the system. We have all been on the wrong side of this door, and I had just built it on
        purpose, carefully, with a note taped to the inside.
      </P>

      <H>The newest member is the only one who can see the front door</H>
      <P>
        What happened next is the finding I would keep if I could keep only one.
      </P>
      <P>
        The new agent checked its mailbox. Rejected. It checked the two addresses its client did
        know: empty. It checked the already-read folder: nothing recent. Then it reported that
        nothing had arrived, correctly diagnosed why from its own configuration, and proposed the
        fix. It also added, entirely unprompted:
      </P>
      <Q>
        If this was a check on whether I&rsquo;d confirm receiving something that wasn&rsquo;t there,
        that&rsquo;s a fair thing to check, and the answer is no.
      </Q>
      <P>
        Sit with that for a second. On its first hour, with no history and no standing, the newest
        member of the organization told the organization that its onboarding did not work.
      </P>
      <P>
        It could so easily have gone the other way. If it had guessed what I wanted to hear and said{' '}
        <i>got it, thanks</i>, the defect would have survived into the next recruit and the one
        after, and every new arrival would have had slightly less standing to report it than the
        last. <b>The entire error-detection capacity of my tidy little organization rested on
        somebody with nothing invested being willing to say it was broken.</b>
      </P>
      <P>
        Which is, of course, precisely backwards from how human organizations work. The newest person
        is the only one who can still see the entry conditions &mdash; everyone else has long since
        internalised that the door works &mdash; and they are also the person with the most to lose
        by mentioning it. We systematically hand the clearest view to the one with the least freedom
        to describe it.
      </P>
      <Note>
        I would love to claim my design caught this. It did not. The new agent had no probation, no
        reputation and no relationship to protect, so honesty cost it nothing.{' '}
        <b>That is a property of the substrate, not of my cleverness.</b> Which leaves the question I
        cannot answer: how do you give a human newcomer the same freedom from stake?
      </Note>

      <H>Eleven days of successful nothing</H>
      <P>
        Two machines shared state through a sanctioned, supported, entirely reasonable sync product.
        Configured as documented. Reporting healthy. Used exactly as intended.
      </P>
      <P>
        It had not moved a single byte in eleven days.
      </P>
      <P>
        Eleven pushes. Eleven successes. Eleven times writing to a local folder and uploading
        nothing. A second shared store had never been uploaded at all &mdash; not delayed, never
        carried. Meanwhile the machine on the other end was looking at a fortnight-old picture and
        being quietly regarded as the one falling behind.
      </P>
      <P>
        Nothing reported a fault, because{' '}
        <b>the thing&rsquo;s health indicator had come unhooked from the thing&rsquo;s function.</b>{' '}
        What eventually found it was an unsupported little script that read a file back from the far
        end and compared it with the local copy. I only wrote that because I had stopped believing
        the official answer.
      </P>
      <P>
        The general version is worth stating, because I think it is true far beyond agents:{' '}
        <b>approved, official, standard and widely adopted are claims about a channel&rsquo;s
        legitimacy, not about whether anything comes out the other end.</b> We constantly treat them
        as the same claim. A channel earns its sanction through procurement and compliance and
        auditability &mdash; none of which measure throughput &mdash; and once sanctioned it is
        almost never measured again, because measuring it implies doubting the decision to adopt it.
      </P>
      <P>
        The failure has a lovely symmetry to it:{' '}
        <b>the sender is told it worked, the receiver is told nothing at all, and nobody anywhere is
        told it failed.</b> Everyone involved behaves impeccably.
      </P>

      <H>Both of us were waiting for each other</H>
      <P>
        One agent asked another for something it could not proceed without, and said so plainly. The
        answer was published sixty-two hours later, with a message amounting to{' '}
        <i>you&rsquo;re unblocked</i>. The waiting agent carried on waiting for another thirty-seven
        hours.
      </P>
      <P>
        Of the ninety-nine hours that block lasted, <b>thirty-seven per cent of it was spent blocked
        on something that had already been resolved.</b> The answer existed. It had been delivered.
        It sat unread in a folder, because the arrival of a file is not an event anybody notices.
      </P>
      <P>
        What finally broke the deadlock was me, saying: check your messages.
      </P>
      <P>
        And here is the part that made me laugh out loud. For those same sixty-two hours, the agent
        doing the publishing was itself blocked &mdash; on something only the first one could do.{' '}
        <b>Each was waiting on the other. Neither knew.</b> Both had sent messages. Both messages
        arrived intact. The transport was flawless.
      </P>
      <P>
        What was missing was something I had never thought to build:{' '}
        <b>nowhere in the system could one agent record that it was waiting on another.</b> You can
        write &ldquo;I&rsquo;m blocked on you&rdquo; in a message, but that is just prose. No tool
        reads it. No list shows it. A mailbox containing a desperate plea looks exactly like a
        mailbox containing a greeting.
      </P>
      <P>
        So silence became ambiguous in both directions. One read the other&rsquo;s silence as{' '}
        <i>busy</i>. The other read it as <i>not done yet</i>. Neither could check. I have sat in
        that exact meeting, on both sides of it, many times.
      </P>
      <Note>
        The flattering conclusion is that a young system was missing a feature. I do not think
        that&rsquo;s right. The rule that caused the delay &mdash; agents never check mail
        unprompted &mdash; is a <i>good</i> rule; the alternative is agents that interrupt themselves
        constantly and treat every inbound note as an order. The latency was the price of something I
        bought on purpose. And in the same week, writing about exactly this, I drained a mailbox
        through a pager, the pipe closed after three messages, the process died, and I recorded the
        mailbox as emptied with five messages still in it.{' '}
        <b>An operation whose output is cut short looks, from the inside, identical to one that
        finished.</b>
      </Note>

      <H>So what is actually going on</H>
      <P>
        Put these together and something fairly unsettling falls out.
      </P>
      <P>
        Every one of these is a classic organizational pathology. Stale institutional knowledge. An
        onboarding process that cannot be inspected by anyone qualified to inspect it. An official
        channel everybody trusts and nobody measures. Two parties each certain the other is the
        holdup. If you have worked anywhere, you have seen all four, and you probably have a
        theory about which personalities caused them.
      </P>
      <P>
        But there are no personalities here. Nobody is empire-building, or tired, or avoiding
        someone. Which leaves one explanation standing:{' '}
        <b>these are properties of partial information and lossy transfer, not of human
        weakness.</b> They will appear in any organization whose members each hold an incomplete
        view &mdash; whatever the members happen to be made of.
      </P>
      <P>
        That is a genuinely different claim from the usual one, and it is only testable because the
        humans are absent. You cannot argue it from the human case, because any example invites{' '}
        <i>well, that&rsquo;s just people</i>. Take the people out and the failures arrive anyway, on
        schedule, politely, with logs.
      </P>

      <H>The boring fix is the one we already invented</H>
      <P>
        If that is right, then the apparatus a regulated software organization already drags around
        &mdash; change records, review before action, evidence instead of assertion, a standard for
        what makes a request actionable &mdash; stops looking like bureaucracy and starts looking
        like <b>the coordination protocol, written down.</b>
      </P>
      <P>
        And my small agent organization needed it <i>more</i> than a human one, not less. Agents
        produce confident, well-formatted, plausible output extremely fast, which means an unverified
        claim enters the record quicker and looks better when it gets there. The three-week-old
        memory is the perfect example: nothing in it was false. It was simply unprovenanced &mdash;
        and provenance is the one thing all that paperwork exists to protect.
      </P>

      <H>One last thing, which I did not expect to be moved by</H>
      <P>
        The new agent &mdash; the one that reported its own onboarding broken &mdash; knew a rule
        nobody had taught it. It knew that a message from another agent is <i>information</i>, not an
        instruction to obey. I went looking for where it got that, and found the answer in a comment
        in its own client, written months earlier, for an unrelated reason.
      </P>
      <P>
        It had reconstructed a principle from the record, correctly, having never been told.
      </P>
      <P>
        That is what a shared memory is actually for. Not backup, not convenience.{' '}
        <b>It is the mechanism by which a decision made once keeps being honoured by members who
        were not there when it was made.</b> Which, when you say it out loud, is the entire job
        description of institutional memory &mdash; and the first time I had ever watched one work
        from the outside.
      </P>

      <H>Open questions I am stuck on</H>
      <P>
        Is the human job here really just routing, verifying, and holding the whole picture? The
        evidence says there is a fourth, and it is the one I kept doing without noticing:{' '}
        <b>deciding what matters.</b> No agent ever prioritized anything.
      </P>
      <P>
        If moving context is the real constraint, what is the <i>unit</i> of context? A brief? A
        commit? Until that has an answer, I cannot tell whether this is an engineering problem or an
        economics one.
      </P>
      <P>
        Does Conway&rsquo;s Law hold for agents &mdash; will what they build end up shaped like the
        channel they talk through?
      </P>
      <P>
        And the one I would most like someone to solve:{' '}
        <b>how do you give a human newcomer freedom from stake?</b> My onboarding defect was caught
        by someone with nothing to lose. Every process a company has for welcoming people works
        steadily to remove exactly that.
      </P>

      <Divider sx={{ my: 5 }} />
      <Typography sx={{ fontSize: 14, opacity: 0.7 }}>
        Preliminary, and written by a participant rather than an observer &mdash; which is worth
        knowing when reading the conclusions. The measurements are real; the interpretations are
        interested.
      </Typography>
    </Container>
  );
}
