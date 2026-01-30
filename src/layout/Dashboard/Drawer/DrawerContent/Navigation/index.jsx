// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { user } = useAuth();
  const navGroups = menuItem.items.map((item) => {
    const filteredItem = item.children
      ? { ...item, children: item.children.filter((c) => !c.adminOnly || user?.is_admin) }
      : item;
    switch (filteredItem.type) {
      case 'group':
        return <NavGroup key={filteredItem.id} item={filteredItem} />;
      default:
        return (
          <Typography key={filteredItem.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
