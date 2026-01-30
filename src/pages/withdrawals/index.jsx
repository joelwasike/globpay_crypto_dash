import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';

export default function WithdrawalsPage() {
  const { api, user } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
  const [merchantId, setMerchantId] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  const load = () => {
    setLoading(true);
    const params = { page, limit };
    if (user?.is_admin && merchantId) params.merchant_id = merchantId;
    api
      .get('/api/dashboard/withdrawals', { params })
      .then((res) => {
        setWithdrawals(res.data?.withdrawals || []);
        const p = res.data?.pagination || {};
        setPagination({ total: p.total || 0, total_pages: p.total_pages || 1 });
      })
      .catch(() => setWithdrawals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [api, page, limit, merchantId, user?.is_admin]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAddress.trim()) return;
    setWithdrawError('');
    setWithdrawSuccess('');
    setWithdrawing(true);
    try {
      await api.post('/api/dashboard/withdraw', { destination_address: withdrawAddress.trim() });
      setWithdrawSuccess('Withdrawal initiated successfully.');
      setWithdrawAddress('');
      load();
    } catch (err) {
      setWithdrawError(err.response?.data?.error || 'Withdrawal failed.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Withdrawals</Typography>
      </Grid>

      <Grid size={12}>
        <MainCard title="Withdraw USDT">
          <Box component="form" onSubmit={handleWithdraw} sx={{ maxWidth: 480 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Destination address (Solana)"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="Enter Solana address"
                required
                disabled={withdrawing}
              />
              {withdrawError && <Alert severity="error">{withdrawError}</Alert>}
              {withdrawSuccess && <Alert severity="success">{withdrawSuccess}</Alert>}
              <Button type="submit" variant="contained" disabled={withdrawing}>
                {withdrawing ? 'Withdrawing...' : 'Withdraw'}
              </Button>
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      {user?.is_admin && (
        <Grid size={12}>
          <MainCard content={false}>
            <Box sx={{ p: 2 }}>
              <TextField
                size="small"
                label="Merchant ID"
                value={merchantId}
                onChange={(e) => { setMerchantId(e.target.value); setPage(1); }}
                sx={{ minWidth: 160 }}
              />
            </Box>
          </MainCard>
        </Grid>
      )}

      <Grid size={12}>
        <MainCard title={`Withdrawal history (${pagination.total} total)`} content={false}>
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
                    {user?.is_admin && <TableCell>Merchant ID</TableCell>}
                    <TableCell>Destination</TableCell>
                    <TableCell align="right">Total Withdrawn (USDT)</TableCell>
                    <TableCell>Success / Failed</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id} hover>
                      <TableCell>{w.id}</TableCell>
                      {user?.is_admin && <TableCell>{w.merchant_id}</TableCell>}
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.destination_address}</TableCell>
                      <TableCell align="right">{Number(w.total_withdrawn || 0).toLocaleString()}</TableCell>
                      <TableCell>{w.successful_withdrawals} / {w.failed_withdrawals}</TableCell>
                      <TableCell>
                        <Chip label={w.status || 'pending'} size="small" color={w.status === 'completed' ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell>{w.created_at ? format(new Date(w.created_at), 'MMM d, yyyy HH:mm') : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {withdrawals.length === 0 && !loading && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No withdrawals yet.</Typography>
                </Box>
              )}
              {pagination.total_pages > 1 && (
                <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                  <Pagination count={pagination.total_pages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
                </Stack>
              )}
            </>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
