import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';

export default function MerchantsPage() {
  const { api, user } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', business_name: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdMerchant, setCreatedMerchant] = useState(null);
  const [listError, setListError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setListError('');
    api
      .get('/api/admin/merchants', { params: { page, limit } })
      .then((res) => {
        setMerchants(res.data?.merchants || []);
        const p = res.data?.pagination || {};
        setPagination({ total: p.total || 0, total_pages: p.total_pages || 1 });
      })
      .catch((err) => {
        setListError(err.response?.data?.error || 'Failed to load merchants');
        setMerchants([]);
      })
      .finally(() => setLoading(false));
  }, [api, page, limit]);

  useEffect(() => {
    if (user?.is_admin) load();
  }, [user?.is_admin, load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await api.post('/api/admin/merchants', {
        email: createForm.email,
        password: createForm.password,
        business_name: createForm.business_name
      });
      setCreatedMerchant(res.data?.merchant || res.data);
      setCreateForm({ email: '', password: '', business_name: '' });
      load();
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create merchant');
    } finally {
      setCreating(false);
    }
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setCreateError('');
    setCreatedMerchant(null);
    setCreateForm({ email: '', password: '', business_name: '' });
  };

  const copyApiKey = (key) => {
    if (key && navigator.clipboard) {
      navigator.clipboard.writeText(key);
    }
  };

  if (!user?.is_admin) {
    return (
      <Grid container>
        <Grid size={12}>
          <MainCard>
            <Typography color="text.secondary">This page is only available to administrators.</Typography>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Typography variant="h5">Merchants</Typography>
          <Button variant="contained" startIcon={<UserAddOutlined />} onClick={() => setCreateOpen(true)}>
            Create merchant
          </Button>
        </Stack>
      </Grid>

      <Grid size={12}>
        <MainCard title={`Merchants (${pagination.total} total)`} content={false}>
          {listError && (
            <Alert severity="error" sx={{ m: 2 }} onClose={() => setListError('')}>
              {listError}
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
                    <TableCell>Email</TableCell>
                    <TableCell>Business name</TableCell>
                    <TableCell>Merchant ID</TableCell>
                    <TableCell>USDT balance</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {merchants.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>{m.id}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>{m.business_name || '—'}</TableCell>
                      <TableCell>{m.merchant_id ?? '—'}</TableCell>
                      <TableCell>{Number(m.usdt_balance || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={m.is_admin ? 'Yes' : 'No'} size="small" color={m.is_admin ? 'primary' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={m.is_active ? 'Yes' : 'No'} size="small" color={m.is_active ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell>{m.created_at ? format(new Date(m.created_at), 'MMM d, yyyy') : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {merchants.length === 0 && !loading && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No merchants yet. Create one to get started.</Typography>
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

      <Dialog open={createOpen} onClose={closeCreate} maxWidth="sm" fullWidth>
        <DialogTitle>Create merchant</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent dividers>
            <Stack spacing={2}>
              {createError && <Alert severity="error">{createError}</Alert>}
              {createdMerchant && (
                <Alert severity="success">
                  <Typography variant="subtitle2">Merchant created.</Typography>
                  <Typography variant="body2">API key (copy and share securely):</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {createdMerchant.api_key}
                    </Typography>
                    <Button size="small" startIcon={<CopyOutlined />} onClick={() => copyApiKey(createdMerchant.api_key)}>
                      Copy
                    </Button>
                  </Stack>
                </Alert>
              )}
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                disabled={creating}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                required
                inputProps={{ minLength: 8 }}
                helperText="Min 8 characters"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                disabled={creating}
              />
              <TextField
                fullWidth
                label="Business name"
                required
                value={createForm.business_name}
                onChange={(e) => setCreateForm((f) => ({ ...f, business_name: e.target.value }))}
                disabled={creating}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCreate}>{createdMerchant ? 'Done' : 'Cancel'}</Button>
            {!createdMerchant && (
              <Button type="submit" variant="contained" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  );
}
