import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../api/authAPI';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/auth.css';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const inputRefs = useRef([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  // OTP expiry countdown
  useEffect(() => {
    if (timer <= 0 || verified) return;
    const t = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timer, verified]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const newOtp = [...otp];
    text.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const focusIdx = Math.min(text.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter the complete 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await verifyOTP({ email, otp: code });
      setVerified(true);
      toast.success(res.message);
      login(res.data.token, res.data.user);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all digits entered
  useEffect(() => {
    if (otp.every(d => d !== '')) handleSubmit();
  }, [otp]);

  const handleResend = async () => {
    try {
      await resendOTP(email);
      toast.success('New code sent!');
      setResendCooldown(60);
      setTimer(600);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  if (!email) return null;

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="branding-content">
          <span className="branding-logo">📚</span>
          <h1 className="branding-title">Thes-ease</h1>
          <p className="branding-subtitle">Almost there! Verify your email to activate your account.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-mobile-header">
          <h1 className="branding-title">Thes-ease</h1>
        </div>

        <div className="auth-form-container">
          {verified ? (
            <div style={{ textAlign: 'center' }} className="fade-in-up">
              <div className="success-icon">✓</div>
              <h2 style={{ marginBottom: 8 }}>Email Verified!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="auth-form-header" style={{ textAlign: 'center' }}>
                <h2>Verify Your Email</h2>
                <p>Enter the 6-digit code sent to</p>
              </div>

              <div className="verify-email-display">
                <span>{email}</span>
              </div>

              <form onSubmit={handleSubmit} id="verify-form">
                <div className="otp-container" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1}
                      className={`otp-input ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      autoFocus={i === 0}
                      id={`otp-input-${i}`}
                    />
                  ))}
                </div>

                {timer > 0 ? (
                  <div className="otp-timer">
                    Code expires in <span className="time">{formatTime(timer)}</span>
                  </div>
                ) : (
                  <div className="otp-timer" style={{ color: 'var(--error)' }}>
                    Code expired. Please request a new one.
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={loading || otp.join('').length !== 6}
                  id="verify-submit-btn"
                >
                  {loading ? <><div className="spinner"></div> Verifying...</> : 'Verify Email'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Didn't receive the code?
                </p>
                <button
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  id="resend-otp-btn"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
