'use client';
import { Box, Paper, Typography } from '@mui/material';
import Link from 'next/link';

/**
 * Entry point to /org. The mark is an inline animated SVG rather than a GIF: it inherits the
 * MUI color scheme, stays sharp on any display, weighs nothing, and needs no asset pipeline.
 * A sheet of paper with lines of text writing themselves, folding into an envelope flap.
 */
function PaperMark() {
  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      aria-hidden
      sx={{ width: 56, height: 56, flexShrink: 0, color: 'primary.main' }}
    >
      {/* sheet */}
      <rect x="12" y="6" width="40" height="46" rx="3"
            fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      {/* lines of text, drawing themselves in sequence */}
      {[16, 23, 30, 37].map((y, i) => (
        <line key={y} x1="19" y1={y} x2="45" y2={y}
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55">
          <animate attributeName="x2" values="19;45;45;19" keyTimes="0;0.25;0.9;1"
                   dur="4.8s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
        </line>
      ))}
      {/* short last line */}
      <line x1="19" y1="44" x2="34" y2="44"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55">
        <animate attributeName="x2" values="19;34;34;19" keyTimes="0;0.25;0.9;1"
                 dur="4.8s" begin="1.4s" repeatCount="indefinite" />
      </line>
      {/* envelope flap folding down over the sheet, then lifting */}
      <path d="M12 40 L32 54 L52 40" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.55;0.7;0.92;1"
                 dur="4.8s" repeatCount="indefinite" />
      </path>
    </Box>
  );
}

export default function PaperCard() {
  return (
    <Paper
      component={Link}
      href="/org"
      variant="outlined"
      sx={{
        display: 'flex', alignItems: 'center', gap: 2.5,
        p: 2.5, mt: 3, textDecoration: 'none', color: 'inherit',
        transition: 'border-color .2s, transform .2s',
        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
      }}
    >
      <PaperMark />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
          Read the paper — The Agentic AI Organization
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14 }}>
          Agentic AI put to practice: several agents, their own mailboxes, one shared memory — and
          every organizational pathology you have ever worked under, reproduced in a system with no
          people in it.
        </Typography>
      </Box>
    </Paper>
  );
}
