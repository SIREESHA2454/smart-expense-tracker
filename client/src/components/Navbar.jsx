import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // On mount, check if dark mode was previously set
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/analytics', label: '📈 Analytics' },
  ];

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>

        {/* Logo */}
        <Link to="/dashboard" style={styles.logo}>
          💰 <span style={styles.logoText}>ExpenseTracker</span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={styles.links}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.link,
                ...(location.pathname === link.path ? styles.linkActive : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div style={styles.actions}>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            style={styles.iconBtn}
            title="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* User greeting */}
          <span style={styles.userName}>
            👤 {user?.name?.split(' ')[0]}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
          >
            Logout
          </button>

          {/* Mobile hamburger */}
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} style={styles.mobileLink}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  logoText: {
    color: 'var(--text-primary)',
  },
  links: {
    display: 'flex',
    gap: '0.25rem',
    '@media(max-width:768px)': { display: 'none' },
  },
  link: {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  linkActive: {
    background: 'var(--accent-light)',
    color: 'var(--accent)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.4rem 0.6rem',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  userName: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.4rem 0.6rem',
    fontSize: '1rem',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    '@media(max-width:768px)': { display: 'block' },
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid var(--border)',
    padding: '0.5rem 1rem',
    background: 'var(--bg-card)',
  },
  mobileLink: {
    padding: '0.75rem 0.5rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
    fontSize: '0.95rem',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
  },
};

export default Navbar;