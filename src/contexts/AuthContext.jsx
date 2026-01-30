import { createContext, useContext, useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = localStorage.getItem('merchant_token');
    if (apiKey) {
      // Validate by fetching profile
      api
        .get('/api/dashboard/profile')
        .then((res) => {
          const p = res.data;
          setUser({
            id: p.id,
            merchant_id: p.merchant_id,
            email: p.email,
            name: p.business_name || p.email,
            business_name: p.business_name,
            is_admin: p.is_admin,
            api_key: p.api_key
          });
        })
        .catch(() => {
          localStorage.removeItem('merchant_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/merchants/login', {
        email,
        password
      });

      const data = response.data;
      if (data.api_key) {
        localStorage.setItem('merchant_token', data.api_key);
        setUser({
          id: data.merchant_id,
          merchant_id: data.merchant_id,
          email: data.email,
          name: data.business_name || data.email,
          business_name: data.business_name,
          is_admin: data.is_admin || false,
          api_key: data.api_key
        });
        return { success: true };
      }
      return { success: false, error: 'Invalid response - no API key' };
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        (error.response?.status === 401 ? 'Invalid email or password' : 'Login failed');
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('merchant_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
};
