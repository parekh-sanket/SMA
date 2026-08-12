import { useEffect, useState } from 'react';
import { Box, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import type { Insights } from '../types';
import { getInsights } from '../api';

interface CountryRoleInsightsProps {
  countries: string[];
  titles: string[];
}

export default function CountryRoleInsights({
  countries,
  titles,
}: CountryRoleInsightsProps) {
  const [country, setCountry] = useState('');
  const [title, setTitle] = useState('');
  const [countryStats, setCountryStats] = useState<Insights | null>(null);
  const [roleStats, setRoleStats] = useState<Insights | null>(null);

  // Default to the first country once facets arrive.
  useEffect(() => {
    if (!country && countries.length) setCountry(countries[0]);
  }, [countries, country]);

  useEffect(() => {
    if (!country) {
      setCountryStats(null);
      return;
    }
    let active = true;
    getInsights({ country })
      .then((s) => active && setCountryStats(s))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [country]);

  useEffect(() => {
    if (!country || !title) {
      setRoleStats(null);
      return;
    }
    let active = true;
    getInsights({ country, title })
      .then((s) => active && setRoleStats(s))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [country, title]);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Typography variant="h6" component="h3">
        Country &amp; Role Insights
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Filter salaries by country and job title to compare compensation
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          select
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: { xs: '100%', sm: 200 } }}
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </TextField>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TextField
            label="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            select
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: { xs: '100%', sm: 240 } }}
          >
            <option value="">Select a job title...</option>
            {titles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </TextField>
          {title && (
            <IconButton
              aria-label="Clear job title"
              size="small"
              onClick={() => setTitle('')}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {countryStats && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <UnderlineCard label={`Min Salary · ${country}`} value={countryStats.minFormatted} color="#22c55e" />
          <UnderlineCard label={`Max Salary · ${country}`} value={countryStats.maxFormatted} color="#ef4444" />
          <UnderlineCard label={`Avg Salary · ${country}`} value={countryStats.averageFormatted} color="#6366f1" />
        </Box>
      )}

      {title && roleStats && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mt: 2,
          }}
        >
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              {title} · {country}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {roleStats.averageFormatted}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average salary
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Employee Count
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
              {roleStats.count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              employees matched
            </Typography>
          </Paper>
        </Box>
      )}
    </Paper>
  );
}

function UnderlineCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
        {value}
      </Typography>
      <Box sx={{ height: 3, bgcolor: color, borderRadius: 2, mt: 1 }} />
    </Paper>
  );
}
