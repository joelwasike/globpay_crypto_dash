import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';
import { toChartTransactions } from 'utils/transactionShape';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';

function StatusChip({ status }) {
  const s = (status || '').toUpperCase();
  let color = 'default';
  let icon = <ClockCircleOutlined />;
  if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'COMPLETE') {
    color = 'success';
    icon = <CheckCircleOutlined />;
  } else if (s === 'PENDING') {
    color = 'warning';
  } else if (s === 'FAILED') {
    color = 'error';
    icon = <CloseCircleOutlined />;
  }
  return <Chip icon={icon} label={status || 'N/A'} color={color} size="small" variant="outlined" />;
}

export default function TransactionsPage() {
  const { api, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [depositId, setDepositId] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit };
      if (statusFilter !== 'all') params.status = statusFilter.toLowerCase();
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (depositId) params.deposit_id = depositId;
      if (user?.is_admin && merchantId) params.merchant_id = merchantId;
      const res = await api.get('/api/dashboard/transactions', { params });
      setTransactions(res.data?.transactions || []);
      const p = res.data?.pagination || {};
      setPagination({ total: p.total || 0, total_pages: p.total_pages || 1 });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [api, page, limit, statusFilter, fromDate, toDate, depositId, merchantId, user?.is_admin]);

  useEffect(() => {
    load();
  }, [load]);

  const forCharts = toChartTransactions(transactions);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Transactions</Typography>
      </Grid>

      <Grid size={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" useFlexGap>
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </TextField>
              <TextField
                size="small"
                type="date"
                label="From"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
              <TextField
                size="small"
                type="date"
                label="To"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
              <TextField
                size="small"
                label="Deposit ID"
                placeholder="Filter by deposit id"
                value={depositId}
                onChange={(e) => { setDepositId(e.target.value); setPage(1); }}
                sx={{ minWidth: 160 }}
              />
              {user?.is_admin && (
                <TextField
                  size="small"
                  label="Merchant ID"
                  placeholder="Merchant ID"
                  value={merchantId}
                  onChange={(e) => { setMerchantId(e.target.value); setPage(1); }}
                  sx={{ minWidth: 120 }}
                />
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setStatusFilter('all');
                  setFromDate('');
                  setToDate('');
                  setDepositId('');
                  setMerchantId('');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard title={`Transactions (${pagination.total} total)`} content={false}>
          {error && (
            <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Deposit / Merchant Ref</TableCell>
                    {user?.is_admin && <TableCell>Merchant</TableCell>}
                    <TableCell align="right">Amount (USDT)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forCharts.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{tx.merchant_deposit_id || tx.deposit_id || '—'}</TableCell>
                      {user?.is_admin && <TableCell>{tx.merchant_email || tx.merchant_id || '—'}</TableCell>}
                      <TableCell align="right">{Number(tx.amount || 0).toLocaleString()}</TableCell>
                      <TableCell><StatusChip status={tx.transaction_status} /></TableCell>
                      <TableCell>{tx.created_at ? format(new Date(tx.created_at), 'MMM d, yyyy HH:mm') : '—'}</TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" onClick={() => setSelected(tx)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transactions.length === 0 && !loading && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No transactions found.</Typography>
                </Box>
              )}
              {pagination.total_pages > 1 && (
                <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                  <Pagination
                    count={pagination.total_pages}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                  />
                </Stack>
              )}
            </>
          )}
        </MainCard>
      </Grid>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={1.5}>
              <Typography variant="body2"><strong>ID:</strong> {selected.id}</Typography>
              <Typography variant="body2"><strong>Deposit ID:</strong> {selected.deposit_id}</Typography>
              <Typography variant="body2"><strong>Merchant deposit ID:</strong> {selected.merchant_deposit_id || '—'}</Typography>
              <Typography variant="body2"><strong>Amount:</strong> {Number(selected.amount || 0).toLocaleString()} USDT</Typography>
              <Typography variant="body2"><strong>Status:</strong> {selected.status}</Typography>
              <Typography variant="body2"><strong>Created:</strong> {selected.created_at ? format(new Date(selected.created_at), 'PPpp') : '—'}</Typography>
              {selected.tx_id && <Typography variant="body2"><strong>Tx ID:</strong> {selected.tx_id}</Typography>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
