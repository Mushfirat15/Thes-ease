import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icon">📚</span>
            <span className="navbar-logo-text">Thes-ease</span>
          </Link>

          <div className="navbar-actions">
            {user ? (
              <div className="navbar-user">
                <div className="navbar-user-info">
                  <div className="navbar-user-name">{user.name}</div>
                  <div className="navbar-user-role">{user.role}</div>
                </div>
                <div className="navbar-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  className="btn btn-ghost navbar-logout-btn"
                  onClick={handleLogout}
                  id="logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" id="nav-login-btn">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary" id="nav-register-btn"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;
