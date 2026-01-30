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
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';

export default function DepositsPage() {
  const { api, user } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
  const [merchantId, setMerchantId] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const params = { page, limit };
        if (user?.is_admin && merchantId) params.merchant_id = merchantId;
        const res = await api.get('/api/dashboard/deposits', { params });
        if (cancelled) return;
        setDeposits(res.data?.deposits || []);
        const p = res.data?.pagination || {};
        setPagination({ total: p.total || 0, total_pages: p.total_pages || 1 });
      } catch (e) {
        console.error(e);
        if (!cancelled) setDeposits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [api, page, limit, merchantId, user?.is_admin]);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Deposits</Typography>
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
        <MainCard title={`Deposits (${pagination.total} total)`} content={false}>
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
                    <TableCell>Deposit ID</TableCell>
                    <TableCell>Merchant Ref</TableCell>
                    {user?.is_admin && <TableCell>Merchant ID</TableCell>}
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Expected (USDT)</TableCell>
                    <TableCell align="right">Received (USDT)</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deposits.map((d) => (
                    <TableRow key={d.id} hover>
                      <TableCell>{d.id}</TableCell>
                      <TableCell>{d.deposit_id}</TableCell>
                      <TableCell>{d.merchant_deposit_id || '—'}</TableCell>
                      {user?.is_admin && <TableCell>{d.merchant_id}</TableCell>}
                      <TableCell>
                        <Chip label={d.status || 'pending'} size="small" color={d.status === 'completed' ? 'success' : d.status === 'failed' ? 'error' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{Number(d.expected_amount || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{Number(d.received_amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{d.created_at ? format(new Date(d.created_at), 'MMM d, yyyy HH:mm') : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {deposits.length === 0 && !loading && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No deposits found.</Typography>
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
