import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import './styles/global.css';

// Redirect authenticated users away from auth pages
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1A2E',
              color: '#EAEAEA',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '0.9rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            },
            success: { iconTheme: { primary: '#00D9A6', secondary: '#1A1A2E' } },
            error: { iconTheme: { primary: '#FF6B6B', secondary: '#1A1A2E' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
