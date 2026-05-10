import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../Button/Button';
import logo from '../../assets/logo.png';
import { getAvatarPath } from '../../utils/avatarMapper';
import './Navbar.css';
import './NavbarComingSoon.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const getAvatar = () => {
    if (!user) return null;
    return getAvatarPath(user.avatar, user.gender, user.role, user.name);
  };

  const profilePath = user?.role === 'employer' ? '/employer-profile' : '/worker-profile';
  const dashboardPath = user?.role === 'employer' ? '/employer-dashboard' : '/worker-dashboard';

  const guestLinks = [
    { name: t('home'), path: '/' },
    { name: t('services'), path: '/services' },
    { name: t('how_it_works'), path: '/how-it-works' },
    { name: t('privacy_policy'), path: '/privacy' },
    { name: t('contact'), path: '/contact' },
    { name: 'Companies (Coming Soon)', path: '/companies' }
  ];

  return (
    <nav className="navbar glass-card">
      <div className="navbar-container">
        <Link to={user ? dashboardPath : "/"} className="navbar-logo" onClick={() => setIsOpen(false)}>
          <img src={logo} alt="Bayti Assist" className="logo-img" />
        </Link>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          {!user ? (
            guestLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${link.path === '/companies' ? 'coming-soon-link' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))
          ) : (
            <>
              {user.role === 'employer' ? (
                <>
                  <NavLink to="/employer-dashboard" className="nav-item" onClick={() => setIsOpen(false)}>{t('dashboard')}</NavLink>
                  <NavLink to="/my-workers" className="nav-item" onClick={() => setIsOpen(false)}>{t('workers')}</NavLink>
                  <NavLink to="/tracking" className="nav-item" onClick={() => setIsOpen(false)}>{t('tracking')}</NavLink>
                  <NavLink to="/companies" className="nav-item coming-soon-link" onClick={() => setIsOpen(false)}>Companies (Soon)</NavLink>
                </>
              ) : user.role === 'worker' ? (
                <>
                  <NavLink to="/worker-dashboard" className="nav-item" onClick={() => setIsOpen(false)}>{t('dashboard')}</NavLink>
                  <NavLink to="/messages" className="nav-item" onClick={() => setIsOpen(false)}>{t('messages')}</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/company-dashboard" className="nav-item" onClick={() => setIsOpen(false)}>Dashboard</NavLink>
                  <NavLink to="/companies" className="nav-item coming-soon-link" onClick={() => setIsOpen(false)}>Public Page</NavLink>
                </>
              )}
            </>
          )}

          {!user ? (
            <div className="nav-auth-mobile">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <button className="login-btn-nav">{t('login')}</button>
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                <Button className="signup-btn-nav">{t('signup')}</Button>
              </Link>
              <button className="lang-toggle-mobile" onClick={toggleLanguage}>
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
          ) : (
            <div className="nav-auth-mobile">
              <button className="lang-toggle-mobile" onClick={toggleLanguage}>
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </button>
              <div className="nav-profile-link mobile" onClick={() => { navigate(profilePath); setIsOpen(false); }}>
                <img src={getAvatar()} alt="Profile" className="nav-avatar" />
              </div>
              <button className="logout-btn-nav" onClick={handleLogout}>{t('logout')}</button>
            </div>
          )}
        </div>

        <div className="nav-actions-desktop">
          <button className="lang-toggle-btn" onClick={toggleLanguage}>
            {i18n.language === 'en' ? 'AR' : 'EN'}
          </button>

          {user && (
            <>
              <div className="nav-profile-link" onClick={() => navigate(profilePath)}>
                <img src={getAvatar()} alt="Profile" className="nav-avatar" />
              </div>
              <button className="logout-btn-nav" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>{t('logout')}</span>
              </button>
            </>
          )}

          {!user && (
            <div className="nav-auth-desktop">
              <Link to="/login" className="login-link">{t('login')}</Link>
              <Link to="/signup">
                <Button className="signup-btn-nav">{t('signup')}</Button>
              </Link>
            </div>
          )}

          <div className={`hamburger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
