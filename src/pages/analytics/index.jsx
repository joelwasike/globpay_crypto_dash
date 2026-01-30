import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const { api } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [byStatus, setByStatus] = useState({ completed: 0, failed: 0, pending: 0 });
  const [overview, setOverview] = useState({ periods: [] });
  const [fromDate, setFromDate] = useState(() => formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  const [toDate, setToDate] = useState(() => formatDate(new Date()));
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [statusRes, overviewRes] = await Promise.all([
          api.get('/api/dashboard/analytics/by-status'),
          api.get('/api/dashboard/analytics/overview', {
            params: { from_date: fromDate, to_date: toDate, group_by: groupBy }
          })
        ]);
        if (cancelled) return;
        setByStatus(statusRes.data?.by_status || {});
        setOverview(overviewRes.data?.analytics || { periods: [] });
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [api, fromDate, toDate, groupBy]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const total = (byStatus.completed || 0) + (byStatus.failed || 0) + (byStatus.pending || 0);
  const successRate = total > 0 ? ((byStatus.completed / total) * 100).toFixed(1) : 0;

  const periods = overview.periods || [];
  const labels = periods.map((p) => p.date);
  const amounts = periods.map((p) => Number(p.total_amount || 0));
  const counts = periods.map((p) => Number(p.transaction_count || 0));

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Analytics</Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title="Total Transactions" count={String(total)} extra={String(byStatus.pending)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title="Completed" count={String(byStatus.completed || 0)} percentage={Number(successRate)} color="success" extra={`${successRate}%`} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title="Pending" count={String(byStatus.pending || 0)} isLoss color="warning" extra={String(byStatus.failed || 0)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title="Total Volume (USDT)" count={`$${periods.reduce((s, p) => s + Number(p.total_amount || 0), 0).toLocaleString()}`} extra="Period" />
      </Grid>

      <Grid size={12}>
        <MainCard title="Filters" content={false}>
          <Stack direction="row" spacing={2} sx={{ p: 2 }} flexWrap="wrap">
            <TextField size="small" type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField size="small" type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField select size="small" label="Group by" value={groupBy} onChange={(e) => setGroupBy(e.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </TextField>
          </Stack>
        </MainCard>
      </Grid>

      {labels.length > 0 && (
        <>
          <Grid size={12}>
            <MainCard title="Volume over time (USDT)" content={false}>
              <Box sx={{ p: 2, height: 360 }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: labels }]}
                  series={[{ data: amounts, label: 'Amount' }]}
                  height={320}
                  colors={[theme.palette.primary.main]}
                />
              </Box>
            </MainCard>
          </Grid>
          <Grid size={12}>
            <MainCard title="Transaction count over time" content={false}>
              <Box sx={{ p: 2, height: 360 }}>
                <LineChart
                  xAxis={[{ scaleType: 'point', data: labels }]}
                  series={[{ data: counts, label: 'Count' }]}
                  height={320}
                  colors={[theme.palette.info.main]}
                />
              </Box>
            </MainCard>
          </Grid>
        </>
      )}

      {labels.length === 0 && (
        <Grid size={12}>
          <MainCard>
            <Typography color="text.secondary">No data for the selected period.</Typography>
          </MainCard>
        </Grid>
      )}
    </Grid>
  );
}
