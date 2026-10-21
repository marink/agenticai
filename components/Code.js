import { Box, Typography } from '@mui/material';

/* A deliberately small highlighter. There is no language here — the queue's own
   status words are the keywords, which is the whole joke and also the point. */

const COLOR = {
  kw:      'primary.main',      // DUE, YES, verified, sent …
  ok:      'success.main',      // YES, OK
  bad:     'error.main',        // NO, FAIL
  cmd:     'text.primary',      // the program being run
  comment: 'text.disabled',
  str:     'warning.main',
  num:     'secondary.main',
  path:    'info.main',
  punct:   'text.disabled',
};

const KW  = /^(?:DUE|verified|sent|unread|read|moved|message|bytes|sha256|from|to|subject|exit)$/;
const OK  = /^(?:YES|OK|zero)$/;
const BAD = /^(?:NO|FAIL|STALE)$/;

const RULES = [
  ['comment', /#[^\n]*/y],
  ['prompt',  /^\s*\$/y],
  ['str',     /"(?:[^"\\]|\\.)*"/y],
  ['time',    /\d{4}-\d{2}-\d{2}T[\d:.\-]+Z?/y],
  ['hash',    /\b[0-9a-f]{8,}\b/y],
  ['path',    /[\w.\-]+\/[\w.\-/]*/y],
  ['word',    /[A-Za-z_][\w.\-]*/y],
  ['num',     /\d+/y],
  ['ws',      /\s+/y],
  ['any',     /[^\s]/y],
];

function tokenize(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    let matched = false;
    for (const [kind, re] of RULES) {
      re.lastIndex = i;
      const m = re.exec(src);
      if (m && m.index === i && m[0].length) {
        out.push([kind, m[0]]);
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) { out.push(['any', src[i]]); i += 1; }
  }
  return out;
}

function colorFor(kind, text, mode) {
  if (kind === 'comment') return COLOR.comment;
  if (kind === 'prompt')  return COLOR.punct;
  if (kind === 'str')     return COLOR.str;
  if (kind === 'time')    return COLOR.num;
  if (kind === 'hash')    return COLOR.num;
  if (kind === 'num')     return COLOR.num;
  if (kind === 'path')    return COLOR.path;
  if (kind === 'word') {
    if (OK.test(text))  return COLOR.ok;
    if (BAD.test(text)) return COLOR.bad;
    if (KW.test(text))  return COLOR.kw;
  }
  return undefined;
}

export default function Code({ children, caption, mode = 'shell' }) {
  const lines = String(children).split('\n');

  return (
    <Box sx={{ my: 3 }}>
      <Box
        component="pre"
        sx={{
          m: 0, p: 2.5, overflowX: 'auto', borderRadius: 1,
          border: 1, borderColor: 'divider', bgcolor: 'action.hover',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: '0.86rem', lineHeight: 1.7,
        }}
      >
        <code>
          {lines.map((line, li) => {
            // frontmatter fences and keys get their own treatment
            if (mode === 'message' && /^---\s*$/.test(line)) {
              return (
                <Box component="span" key={li} sx={{ color: COLOR.punct, display: 'block' }}>
                  {line}{'\n'}
                </Box>
              );
            }
            const fm = mode === 'message' && line.match(/^([A-Za-z][\w-]*):(.*)$/);
            if (fm) {
              return (
                <Box component="span" key={li} sx={{ display: 'block' }}>
                  <Box component="span" sx={{ color: COLOR.kw, fontWeight: 600 }}>{fm[1]}:</Box>
                  <Box component="span" sx={{ color: COLOR.str }}>{fm[2]}</Box>
                  {'\n'}
                </Box>
              );
            }
            const isCmd = /^\s*\$/.test(line);
            return (
              <Box component="span" key={li} sx={{ display: 'block' }}>
                {tokenize(line).map(([kind, text], ti) => {
                  const col = colorFor(kind, text, mode);
                  const bold = isCmd && kind === 'word' && ti <= 2;
                  if (!col && !bold) return <span key={ti}>{text}</span>;
                  return (
                    <Box component="span" key={ti}
                         sx={{ color: col, fontWeight: bold ? 700 : undefined }}>
                      {text}
                    </Box>
                  );
                })}
                {'\n'}
              </Box>
            );
          })}
        </code>
      </Box>
      {caption && (
        <Typography sx={{ fontSize: 13, opacity: 0.7, mt: 1 }}>{caption}</Typography>
      )}
    </Box>
  );
}
