import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import ReportAreaChart from 'sections/dashboard/default/ReportAreaChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import SaleReportCard from 'sections/dashboard/default/SaleReportCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import { useAuth } from 'contexts/AuthContext';
import { toChartTransactions } from 'utils/transactionShape';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

const avatarSX = { width: 36, height: 36, fontSize: '1rem' };
const actionSX = { mt: 0.75, ml: 1, top: 'auto', right: 'auto', alignSelf: 'flex-start', transform: 'none' };

export default function DashboardDefault() {
  const { api } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryRes, txRes] = await Promise.all([
        api.get('/api/dashboard/summary'),
        api.get('/api/dashboard/transactions', { params: { page: 1, limit: 50 } })
      ]);
      const s = summaryRes.data?.summary || {};
      setSummary(s);
      const list = txRes.data?.transactions || [];
      setTransactions(toChartTransactions(list));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const totalTx = summary?.total_transactions ?? 0;
  const completedTx = summary?.completed_transactions ?? 0;
  const failedTx = summary?.failed_transactions ?? 0;
  const pendingTx = summary?.pending_transactions ?? 0;
  const totalAmount = summary?.total_amount_collected ?? 0;
  const balance = summary?.total_usdt_balance ?? 0;
  const successRate = totalTx > 0 ? ((completedTx / totalTx) * 100).toFixed(1) : 0;

  const weeklySuccessful = transactions
    .filter((t) => {
      const d = new Date(t.date_added * 1000);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo && (t.transaction_status === 'SUCCESS' || t.transaction_status === 'COMPLETED');
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Collected (USDT)"
          count={`$${Number(totalAmount).toLocaleString()}`}
          extra={`${completedTx} completed`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Transactions"
          count={String(totalTx)}
          extra={String(pendingTx)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title="Pending"
          count={String(pendingTx)}
          isLoss
          color="warning"
          extra={String(failedTx)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title="Success Rate"
          count={`${successRate}%`}
          isLoss={parseFloat(successRate) < 90}
          color={parseFloat(successRate) >= 90 ? 'success' : 'warning'}
          extra={`Balance: $${Number(balance).toLocaleString()}`}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard transactions={transactions} />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">This Week</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Weekly volume (USDT)
              </Typography>
              <Typography variant="h3">${weeklySuccessful.toLocaleString()}</Typography>
            </Stack>
          </Box>
          <MonthlyBarChart transactions={transactions} />
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Recent Transactions</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable transactions={transactions} />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Summary</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
            <ListItemButton divider>
              <ListItemText primary="Total Volume (USDT)" />
              <Typography variant="h5">${Number(totalAmount).toLocaleString()}</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Success Rate" />
              <Typography variant="h5">{successRate}%</Typography>
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary="Failed" />
              <Typography variant="h5" color={failedTx > 10 ? 'error.main' : 'success.main'}>
                {failedTx}
              </Typography>
            </ListItemButton>
          </List>
          <ReportAreaChart transactions={transactions} />
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <SaleReportCard transactions={transactions} />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Recent</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ px: 0, py: 0, '& .MuiListItemButton-root': { py: 1.5, px: 2, '& .MuiAvatar-root': avatarSX } }}>
            {transactions.slice(0, 3).map((tx, idx) => {
              const icons = [GiftOutlined, MessageOutlined, SettingOutlined];
              const colors = ['success', 'primary', 'error'];
              const Icon = icons[idx % 3];
              const color = colors[idx % 3];
              return (
                <ListItem
                  key={tx.id || idx}
                  component={ListItemButton}
                  divider={idx < 2}
                  secondaryAction={
                    <Stack sx={{ alignItems: 'flex-end' }}>
                      <Typography variant="subtitle1" noWrap>
                        ${Number(tx.amount || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="h6" color="secondary" noWrap>
                        {tx.transaction_status}
                      </Typography>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ color: `${color}.main`, bgcolor: `${color}.lighter` }}>
                      <Icon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle1">#{tx.merchant_deposit_id || tx.id}</Typography>}
                    secondary={tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                  />
                </ListItem>
              );
            })}
          </List>
        </MainCard>
      </Grid>
    </Grid>
  );
}
