import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { Employee } from '../../../types/models';
import type {
  AnalyticsSummary,
  BreakdownDimension,
  BreakdownGroup,
  Distribution,
} from '../types';
import { getBreakdown, getDistribution, getSummary, getTopEarners } from '../api';

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dimension, setDimension] = useState<BreakdownDimension>('department');
  const [breakdown, setBreakdown] = useState<BreakdownGroup[]>([]);
  const [topEarners, setTopEarners] = useState<Employee[]>([]);
  const [distribution, setDistribution] = useState<Distribution | null>(null);

  useEffect(() => {
    getSummary().then(setSummary).catch(() => {});
    getTopEarners(5).then(setTopEarners).catch(() => {});
    getDistribution().then(setDistribution).catch(() => {});
  }, []);

  useEffect(() => {
    getBreakdown(dimension)
      .then(setBreakdown)
      .catch(() => setBreakdown([]));
  }, [dimension]);

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Dashboard
      </Typography>

      {summary && (
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 3 }}>
          <StatCard label="Headcount" value={String(summary.headcount)} />
          <StatCard label="Total Payroll" value={summary.totalPayrollFormatted} />
          <StatCard label="Average" value={summary.averageFormatted} />
          <StatCard label="Median" value={summary.medianFormatted} />
        </Stack>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="h6" component="h3">
            Breakdown
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={dimension}
            onChange={(_e, v) => {
              if (v) setDimension(v);
            }}
          >
            <ToggleButton value="department">Department</ToggleButton>
            <ToggleButton value="country">Country</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{dimension === 'country' ? 'Country' : 'Department'}</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Average</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {breakdown.map((g) => (
              <TableRow key={g.key}>
                <TableCell>{g.key}</TableCell>
                <TableCell align="right">{g.count}</TableCell>
                <TableCell align="right">{g.totalFormatted}</TableCell>
                <TableCell align="right">{g.averageFormatted}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          Top Earners
        </Typography>
        <Stack spacing={0.5}>
          {topEarners.map((e) => (
            <Stack key={e.id} direction="row" justifyContent="space-between">
              <Link component={RouterLink} to={`/employees/${e.id}`}>
                {e.name}
              </Link>
              <Typography component="span">{e.salaryFormatted}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          Salary Distribution
        </Typography>
        {distribution && <DistributionChart distribution={distribution} />}
      </Paper>
    </Box>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Paper sx={{ p: 2, minWidth: 160 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" component="p">
        {value}
      </Typography>
    </Paper>
  );
}

function DistributionChart({ distribution }: { distribution: Distribution }) {
  const max = Math.max(1, ...distribution.buckets.map((b) => b.count));
  const dollars = (minor: number) => `$${(minor / 100).toLocaleString('en-US')}`;

  return (
    <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 160 }}>
      {distribution.buckets.map((b) => (
        <Stack
          key={b.start}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ flex: 1, height: '100%' }}
        >
          <Typography variant="caption">{b.count}</Typography>
          <Box
            role="img"
            aria-label={`salary band ${dollars(b.start)} to ${dollars(b.end)}, ${b.count} employees`}
            sx={{
              width: '100%',
              bgcolor: 'primary.main',
              height: `${(b.count / max) * 100}%`,
              minHeight: 2,
              borderRadius: 1,
            }}
          />
          <Typography variant="caption" color="text.secondary" noWrap>
            {dollars(b.start)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
