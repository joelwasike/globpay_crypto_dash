import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

export default function ProfilePage() {
  const { api } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [solanaAddress, setSolanaAddress] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateSuccess, setRegenerateSuccess] = useState('');

  useEffect(() => {
    api
      .get('/api/dashboard/profile')
      .then((res) => {
        const p = res.data || {};
        setProfile(p);
        setBusinessName(p.business_name || '');
        setSolanaAddress(p.solana_address || '');
      })
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, [api]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/dashboard/profile', {
        business_name: businessName || undefined,
        solana_address: solanaAddress || undefined
      });
      setProfile((prev) => ({ ...prev, business_name: businessName, solana_address: solanaAddress }));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm do not match.');
      return;
    }
    try {
      await api.put('/api/dashboard/profile/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordSuccess('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password.');
    }
  };

  const regenerateApiKey = async () => {
    setRegenerateSuccess('');
    setRegenerating(true);
    try {
      const res = await api.post('/api/dashboard/profile/regenerate-api-key');
      setRegenerateSuccess('API key regenerated. Store it securely; it will not be shown again.');
      setProfile((prev) => ({ ...prev, api_key: res.data?.api_key || prev?.api_key }));
    } catch (err) {
      setRegenerateSuccess(err.response?.data?.error || 'Failed to regenerate API key.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <Grid container>
        <Grid size={12}>
          <Typography>Loading...</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Profile</Typography>
      </Grid>

      <Grid size={12}>
        <MainCard title="Profile">
          <Box component="form" onSubmit={saveProfile}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Email" value={profile?.email || ''} disabled />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Merchant ID" value={profile?.merchant_id ?? ''} disabled />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Solana address"
                  value={solanaAddress}
                  onChange={(e) => setSolanaAddress(e.target.value)}
                  placeholder="Receiving address for USDT"
                />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? 'Saving...' : 'Save profile'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard title="API key">
          <Stack spacing={2}>
            <TextField
              fullWidth
              type={showApiKey ? 'text' : 'password'}
              label="API key"
              value={profile?.api_key || ''}
              disabled
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end" size="small">
                      {showApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button variant="outlined" color="warning" onClick={regenerateApiKey} disabled={regenerating}>
              {regenerating ? 'Regenerating...' : 'Regenerate API key'}
            </Button>
            {regenerateSuccess && (
              <Alert severity={regenerateSuccess.startsWith('API key regenerated') ? 'success' : 'error'}>{regenerateSuccess}</Alert>
            )}
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard title="Change password">
          <Box component="form" onSubmit={changePassword}>
            <Stack spacing={2} sx={{ maxWidth: 400 }}>
              <TextField
                fullWidth
                type="password"
                label="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <TextField
                fullWidth
                type="password"
                label="New password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordError && <Alert severity="error">{passwordError}</Alert>}
              {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}
              <Button type="submit" variant="contained">
                Update password
              </Button>
            </Stack>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}
