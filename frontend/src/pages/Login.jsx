import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authAPI';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        toast.error('Please verify your email first');
        navigate('/verify-email', { state: { email: data.email } });
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-branding">
        <div className="branding-content">
          <span className="branding-logo">📚</span>
          <h1 className="branding-title">Thes-ease</h1>
          <p className="branding-subtitle">
            Your centralized platform for seamless thesis consultation scheduling at BRAC University.
          </p>
          <div className="branding-features">
            <div className="branding-feature">
              <span className="branding-feature-icon">🎯</span>
              <span className="branding-feature-text">Match with supervisors based on research interests</span>
            </div>
            <div className="branding-feature">
              <span className="branding-feature-icon">📅</span>
              <span className="branding-feature-text">Book consultation slots with a single click</span>
            </div>
            <div className="branding-feature">
              <span className="branding-feature-icon">🔔</span>
              <span className="branding-feature-text">Receive instant booking notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-mobile-header">
          <h1 className="branding-title">Thes-ease</h1>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Log in to your Thes-ease account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            <div className="input-group">
              <label htmlFor="email">University Email</label>
              <input
                id="email" name="email" type="email"
                className={`input-field ${errors.email ? 'error' : ''}`}
                placeholder="example@g.bracu.ac.bd"
                value={form.email} onChange={handleChange}
              />
              {errors.email && <span className="input-error">⚠ {errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                className={`input-field ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={form.password} onChange={handleChange}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁'}
              </button>
              {errors.password && <span className="input-error">⚠ {errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading} id="login-submit-btn">
              {loading ? <><div className="spinner"></div> Logging in...</> : 'Log In'}
            </button>
          </form>

          <div className="auth-form-footer">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
