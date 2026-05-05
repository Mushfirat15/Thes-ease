import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/authAPI';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('thes-ease-token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await getProfile();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('thes-ease-token');
      localStorage.removeItem('thes-ease-user');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('thes-ease-token', token);
    localStorage.setItem('thes-ease-user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('thes-ease-token');
    localStorage.removeItem('thes-ease-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
