import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import nmLogo from '../assets/nm_logo.png';
import smLogo from '../assets/sm_logo.png';
import '../styles/Navbar.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  if (user) {
    if (user.email === 'admin@smgroups.com' || user.email === 'thesmgroups@gmail.com') {
      navLinks.push({ name: 'Admin Portal', path: '/admin' });
    } else {
      navLinks.push({ name: 'Dashboard', path: '/dashboard' });
    }
  }

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={nmLogo}
            alt="Naan Mudhalvan Logo"
            className="navbar-logo"
            style={{ height: '55px', width: 'auto' }}
          />
          <span style={{ height: '30px', width: '1px', background: 'rgba(0,0,0,0.15)' }}></span>
          <img
            src={smLogo}
            alt="The SM Groups Logo"
            className="navbar-logo"
            style={{ height: '38px', width: 'auto' }}
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={isActive(link.path) ? 'active' : ''}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="nav-auth-buttons">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-600)' }}>
                Hi, {user.fullName ? user.fullName.split(' ')[0] : 'Student'}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu active">
          <ul className="mobile-menu-links">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={isActive(link.path) ? 'active' : ''}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {user ? (
              <li>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    textAlign: 'left',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '10px 0',
                    cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}