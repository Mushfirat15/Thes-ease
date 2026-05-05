import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div className="glass-card" style={{ padding: '40px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: '#fff', fontWeight: 700,
            boxShadow: '0 0 30px var(--primary-glow)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 4 }}>
            Welcome, {user?.name}!
          </h1>
          <span className={`badge badge-${user?.role}`}>
            {user?.role === 'student' ? '🎓' : '👨‍🏫'} {user?.role}
          </span>
        </div>

        <div style={{
          background: 'rgba(108, 99, 255, 0.06)', borderRadius: 'var(--radius-md)',
          padding: 24, marginBottom: 24
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
            Account Details
          </h3>
          {[
            ['📧', 'Email', user?.email],
            ['🏷️', 'Role', user?.role],
            ['✅', 'Status', user?.isVerified ? 'Verified' : 'Unverified'],
          ].map(([icon, label, value]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--border-light)'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {icon} {label}
              </span>
              <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
            </div>
          ))}
        </div>

        {user?.role === 'student' ? (
          <div style={{
            padding: 20, background: 'rgba(108, 99, 255, 0.04)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              🎓 As a <strong>student</strong>, you'll be able to browse advisor profiles, book consultation slots, and manage your thesis meetings.
            </p>
          </div>
        ) : (
          <div style={{
            padding: 20, background: 'rgba(0, 217, 166, 0.04)',
            border: '1px solid rgba(0, 217, 166, 0.15)', borderRadius: 'var(--radius-md)', textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              👨‍🏫 As a <strong>supervisor</strong>, you'll be able to define consultation routines, create time slots, and view booked students.
            </p>
          </div>
        )}

        <button className="btn btn-secondary" onClick={handleLogout}
          style={{ width: '100%', marginTop: 24 }} id="dashboard-logout-btn">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
