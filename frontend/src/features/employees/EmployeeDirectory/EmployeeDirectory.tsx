import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import type {
  EmployeeFacets,
  ListEmployeesQuery,
  PaginatedEmployees,
  SortBy,
} from '../../../types/models';
import { getFacets, listEmployees } from '../api';
import { EMPLOYMENT_TYPE_LABELS, STATUS_LABELS } from '../labels';

const INITIAL_QUERY: ListEmployeesQuery = {
  page: 1,
  pageSize: 25,
  sortBy: 'name',
  order: 'asc',
};

export default function EmployeeDirectory() {
  const [query, setQuery] = useState<ListEmployeesQuery>(INITIAL_QUERY);
  const [result, setResult] = useState<PaginatedEmployees | null>(null);
  const [facets, setFacets] = useState<EmployeeFacets>({ departments: [], countries: [] });

  useEffect(() => {
    getFacets()
      .then(setFacets)
      .catch(() => setFacets({ departments: [], countries: [] }));
  }, []);

  useEffect(() => {
    let active = true;
    listEmployees(query)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) setResult({ data: [], page: query.page, pageSize: query.pageSize, total: 0 });
      });
    return () => {
      active = false;
    };
  }, [query]);

  // Any filter/search/sort change returns to the first page.
  const applyFilter = (patch: Partial<ListEmployeesQuery>) =>
    setQuery((q) => ({ ...q, ...patch, page: 1 }));

  const toggleSort = (column: SortBy) =>
    setQuery((q) => ({
      ...q,
      sortBy: column,
      order: q.sortBy === column && q.order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));

  const onText =
    (field: 'q' | 'department' | 'country') =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      applyFilter({ [field]: e.target.value || undefined });

  const rows = result?.data ?? [];

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2, gap: 1, flexWrap: 'wrap' }}
      >
        <Typography variant="h5" component="h2">
          Employees
        </Typography>
        <Button variant="contained" component={RouterLink} to="/employees/new">
          Add Employee
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        <TextField
          label="Search"
          value={query.q ?? ''}
          onChange={onText('q')}
          placeholder="Name or email"
          size="small"
          sx={{ width: { xs: '100%', sm: 220 } }}
        />
        <TextField
          label="Department"
          value={query.department ?? ''}
          onChange={onText('department')}
          select
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: { xs: '100%', sm: 180 } }}
        >
          <option value="">All</option>
          {facets.departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </TextField>
        <TextField
          label="Country"
          value={query.country ?? ''}
          onChange={onText('country')}
          select
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: { xs: '100%', sm: 180 } }}
        >
          <option value="">All</option>
          {facets.countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={query.sortBy === 'name' ? query.order : false}>
                <TableSortLabel
                  active={query.sortBy === 'name'}
                  direction={query.sortBy === 'name' ? query.order : 'asc'}
                  onClick={() => toggleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Title</TableCell>
              <TableCell sortDirection={query.sortBy === 'salary' ? query.order : false}>
                <TableSortLabel
                  active={query.sortBy === 'salary'}
                  direction={query.sortBy === 'salary' ? query.order : 'asc'}
                  onClick={() => toggleSort('salary')}
                >
                  Salary
                </TableSortLabel>
              </TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/employees/${e.id}`}>
                    {e.name}
                  </Link>
                </TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.country}</TableCell>
                <TableCell>{e.title}</TableCell>
                <TableCell>{e.salaryFormatted}</TableCell>
                <TableCell>{EMPLOYMENT_TYPE_LABELS[e.employmentType]}</TableCell>
                <TableCell>{STATUS_LABELS[e.status]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        sx={{ '.MuiTablePagination-toolbar': { flexWrap: 'wrap', rowGap: 1 } }}
        count={result?.total ?? 0}
        page={query.page - 1}
        onPageChange={(_e, newPage) => setQuery((q) => ({ ...q, page: newPage + 1 }))}
        rowsPerPage={query.pageSize}
        onRowsPerPageChange={(e) =>
          setQuery((q) => ({ ...q, pageSize: Number(e.target.value), page: 1 }))
        }
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
}
