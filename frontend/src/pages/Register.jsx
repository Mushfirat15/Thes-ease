import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authAPI';
import toast from 'react-hot-toast';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const detectRole = (email) => {
    if (email.endsWith('@g.bracu.ac.bd')) return 'student';
    if (email.endsWith('@bracu.ac.bd')) return 'supervisor';
    return null;
  };

  const getPasswordStrength = (p) => {
    if (!p) return { level: 0, label: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', cls: 'weak' };
    if (score <= 2) return { level: 2, label: 'Medium', cls: 'medium' };
    return { level: 3, label: 'Strong', cls: 'strong' };
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!detectRole(form.email.toLowerCase())) e.email = 'Must be a BRACU email (@g.bracu.ac.bd or @bracu.ac.bd)';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await registerUser(form);
      toast.success(res.message);
      navigate('/verify-email', { state: { email: form.email.toLowerCase(), role: res.data.role } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const role = detectRole(form.email.toLowerCase());
  const strength = getPasswordStrength(form.password);

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
        {/* Mobile header */}
        <div className="auth-mobile-header">
          <h1 className="branding-title">Thes-ease</h1>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Register with your BRACU university email</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="register-form">
            {/* Name */}
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                className={`input-field ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                value={form.name} onChange={handleChange}
              />
              {errors.name && <span className="input-error">⚠ {errors.name}</span>}
            </div>

            {/* Email */}
            <div className="input-group">
              <label htmlFor="email">University Email</label>
              <input
                id="email" name="email" type="email"
                className={`input-field ${errors.email ? 'error' : role ? 'success' : ''}`}
                placeholder="example@g.bracu.ac.bd"
                value={form.email} onChange={handleChange}
              />
              {role && (
                <div className="email-role-indicator">
                  <span className={`badge badge-${role}`}>
                    {role === 'student' ? '🎓' : '👨‍🏫'} {role}
                  </span>
                </div>
              )}
              {errors.email && <span className="input-error">⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                className={`input-field ${errors.password ? 'error' : ''}`}
                placeholder="Minimum 8 characters"
                value={form.password} onChange={handleChange}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁'}
              </button>
              {form.password && (
                <>
                  <div className="password-strength">
                    {[1,2,3].map(i => (
                      <div key={i} className={`strength-bar ${i <= strength.level ? `active ${strength.cls}` : ''}`}/>
                    ))}
                  </div>
                  <span className={`strength-text ${strength.cls}`}>{strength.label}</span>
                </>
              )}
              {errors.password && <span className="input-error">⚠ {errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword} onChange={handleChange}
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? '🙈' : '👁'}
              </button>
              {errors.confirmPassword && <span className="input-error">⚠ {errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading} id="register-submit-btn">
              {loading ? <><div className="spinner"></div> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-form-footer">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
