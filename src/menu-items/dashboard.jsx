import {
  DashboardOutlined,
  BarChartOutlined,
  ShoppingOutlined,
  WalletOutlined,
  SendOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';

const icons = {
  DashboardOutlined,
  BarChartOutlined,
  ShoppingOutlined,
  WalletOutlined,
  SendOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined
};

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'analytics',
      title: 'Analytics',
      type: 'item',
      url: '/analytics',
      icon: icons.BarChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'transactions',
      title: 'Transactions',
      type: 'item',
      url: '/transactions',
      icon: icons.ShoppingOutlined,
      breadcrumbs: false
    },
    {
      id: 'deposits',
      title: 'Deposits',
      type: 'item',
      url: '/deposits',
      icon: icons.WalletOutlined,
      breadcrumbs: false
    },
    {
      id: 'withdrawals',
      title: 'Withdrawals',
      type: 'item',
      url: '/withdrawals',
      icon: icons.SendOutlined,
      breadcrumbs: false
    },
    {
      id: 'merchants',
      title: 'Merchants',
      type: 'item',
      url: '/merchants',
      icon: icons.TeamOutlined,
      breadcrumbs: false,
      adminOnly: true
    },
    {
      id: 'profile',
      title: 'Profile',
      type: 'item',
      url: '/profile',
      icon: icons.UserOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
