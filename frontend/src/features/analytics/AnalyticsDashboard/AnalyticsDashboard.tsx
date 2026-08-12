import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, Link, Paper, Stack, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import PaymentsIcon from '@mui/icons-material/Payments';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PublicIcon from '@mui/icons-material/Public';
import ApartmentIcon from '@mui/icons-material/Apartment';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Employee } from '../../../types/models';
import type { AnalyticsSummary, BreakdownGroup, Distribution } from '../types';
import { getBreakdown, getDistribution, getSummary, getTopEarners } from '../api';
import { getFacets } from '../../employees/api';
import CountryRoleInsights from '../CountryRoleInsights';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#22c55e', '#f59e0b',
  '#ef4444', '#3b82f6', '#06b6d4', '#a855f7', '#10b981', '#eab308',
];

const usd = (minor: number) => `$${Math.round(minor / 100).toLocaleString('en-US')}`;
const kAxis = (v: number) => `$${v / 1000}k`;
const tip = (v: number) => `$${v.toLocaleString('en-US')}`;

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [facets, setFacets] = useState<{
    departments: string[];
    countries: string[];
    titles: string[];
  }>({ departments: [], countries: [], titles: [] });
  const [deptBreakdown, setDeptBreakdown] = useState<BreakdownGroup[]>([]);
  const [countryBreakdown, setCountryBreakdown] = useState<BreakdownGroup[]>([]);
  const [topEarners, setTopEarners] = useState<Employee[]>([]);
  const [distribution, setDistribution] = useState<Distribution | null>(null);

  useEffect(() => {
    getSummary().then(setSummary).catch(() => {});
    getFacets().then(setFacets).catch(() => {});
    getBreakdown('department').then(setDeptBreakdown).catch(() => {});
    getBreakdown('country').then(setCountryBreakdown).catch(() => {});
    getTopEarners(5).then(setTopEarners).catch(() => {});
    getDistribution().then(setDistribution).catch(() => {});
  }, []);

  const distData = (distribution?.buckets ?? []).map((b) => ({
    range: `${usd(b.start)}–${usd(b.end)}`,
    count: b.count,
  }));
  const countryData = [...countryBreakdown]
    .sort((a, b) => b.averageMinor - a.averageMinor)
    .map((g) => ({ name: g.key, avg: Math.round(g.averageMinor / 100) }));
  const deptData = [...deptBreakdown]
    .sort((a, b) => b.averageMinor - a.averageMinor)
    .map((g) => ({ name: g.key, avg: Math.round(g.averageMinor / 100) }));

  return (
    <Box>
      <Typography variant="h5" component="h2">
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Analytics across your organization
      </Typography>

      {summary && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          <StatCard icon={<GroupsIcon />} label="Total Employees" value={summary.headcount.toLocaleString('en-US')} color="#6366f1" />
          <StatCard icon={<PaymentsIcon />} label="Total Payroll" value={summary.totalPayrollFormatted} color="#22c55e" />
          <StatCard icon={<ShowChartIcon />} label="Average Salary" value={summary.averageFormatted} color="#3b82f6" />
          <StatCard icon={<ShowChartIcon />} label="Median Salary" value={summary.medianFormatted} color="#8b5cf6" />
          <StatCard icon={<PublicIcon />} label="Countries" value={String(facets.countries.length)} color="#14b8a6" />
          <StatCard icon={<ApartmentIcon />} label="Departments" value={String(facets.departments.length)} color="#f59e0b" />
        </Box>
      )}

      <CountryRoleInsights
        countries={facets.countries ?? []}
        titles={facets.titles ?? []}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <ChartCard title="Salary Distribution" subtitle="Headcount by salary range">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Paying Countries" subtitle="Highest average salary by country">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tickFormatter={kAxis} />
              <Tooltip formatter={tip} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {countryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>

      <ChartCard title="Avg Salary by Department" subtitle="Average compensation across teams">
        <ResponsiveContainer width="100%" height={Math.max(240, deptData.length * 40)}>
          <BarChart data={deptData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={kAxis} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
            <Tooltip formatter={tip} />
            <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
              {deptData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Paper sx={{ p: 2, mt: 2 }}>
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
    </Box>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        </Stack>
        <Typography
          component="p"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '2rem' },
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="h3">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {subtitle}
      </Typography>
      {children}
    </Paper>
  );
}
