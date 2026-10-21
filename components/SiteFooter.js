import { Box, Container, Link as MuiLink, Typography } from '@mui/material';

const SITES = [
  { href: 'https://marinkokona.com',        label: 'Main site' },
  { href: 'https://marin.kokona.website',   label: 'Writing' },
  { href: 'https://probabilistic.net',      label: 'Research' },
  { href: 'https://machinelearning.js.org', label: 'Machine learning' },
];

export default function SiteFooter() {
  return (
    <Box component="footer" sx={{ mt: 8, py: 3 }}>
      <Container maxWidth="md" sx={{ borderTop: 1, borderColor: 'divider', pt: 2.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          {SITES.map((s, i) => (
            <Box key={s.href} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {i > 0 && <Typography component="span" sx={{ opacity: 0.35, fontSize: 13 }}>|</Typography>}
              <MuiLink
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: 13, color: 'text.secondary', textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline', color: 'text.primary' },
                }}
              >
                {s.label}
              </MuiLink>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
