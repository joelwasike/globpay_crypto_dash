// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// assets
import logo from '../../assets/images/logo.jpg';

// ==============================|| LOGO - CRYPTO GATEWAY ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src={logo}
        alt="Crypto Gateway Dashboard"
        sx={{
          height: 35,
          width: 35,
          borderRadius: 1
        }}
      />
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#00606c',
          fontSize: '1.25rem'
        }}
      >
        Crypto Gateway
      </Typography>
    </Box>
  );
}
