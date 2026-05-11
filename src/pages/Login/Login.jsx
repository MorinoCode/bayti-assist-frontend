import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import loginLogo from '../../assets/loginpage/login.png';
import './Login.css';

const countryCodes = [
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
];

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('employer');
  const [loginMethod, setLoginMethod] = useState('email');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+965');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginMethod === 'email' ? email : undefined,
          phone: loginMethod === 'phone' ? phone : undefined,
          countryCode: loginMethod === 'phone' ? countryCode : undefined,
          password,
          method: loginMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data);
      
      const role = data.role?.toLowerCase();
      
      // If profile is incomplete (no gender/avatar), go to role-specific onboarding
      if (!data.gender || !data.avatar) {
        if (role === 'employer') {
          navigate('/onboarding-employee');
        } else {
          navigate('/onboarding-worker');
        }
      } else if (role === 'employer') {
        navigate('/employer-dashboard');
      } else {
        navigate('/worker-dashboard');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glow"></div>
      
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="logo-icon">
            <img src={loginLogo} alt="Login" className="login-logo-img" />
          </div>
          <h1 className="brand-name">{t('brand')}</h1>
          <p className="subtitle">{t('welcome_back')}</p>
        </div>

        <div className="role-tabs">
          <div 
            className={`tab-item ${activeTab === 'employer' ? 'active' : ''}`}
            onClick={() => setActiveTab('employer')}
          >
            {t('employer')}
          </div>
          <div 
            className={`tab-item ${activeTab === 'worker' ? 'active' : ''}`}
            onClick={() => setActiveTab('worker')}
          >
            {t('worker')}
          </div>
          <div className={`tab-indicator ${activeTab}`}></div>
        </div>

        <div className="method-switcher">
          <button 
            className={loginMethod === 'phone' ? 'active' : ''} 
            onClick={() => setLoginMethod('phone')}
          >
            {t('phone_number')}
          </button>
          <button 
            className={loginMethod === 'email' ? 'active' : ''} 
            onClick={() => setLoginMethod('email')}
          >
            {t('email_address')}
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div key={loginMethod} className="animate-fade">
            {loginMethod === 'phone' ? (
              <div className="phone-input-group">
                <label>{t('phone_number')}</label>
                <div className="phone-wrapper">
                  <select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="country-select"
                  >
                    {countryCodes.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    placeholder="555 1234" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>
            ) : (
              <Input 
                label={t('email_address')}
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            )}
          </div>

          <Input 
            label={t('password')}
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />

          <Button type="submit" isLoading={isLoading} className="main-submit">
            {t('sign_in')}
          </Button>
        </form>

        <div className="social-login">
          <div className="divider">
            <span>{t('or_continue_with')}</span>
          </div>

          <div className="social-buttons">
            <button className="social-btn apple" onClick={() => {/* Apple logic */}}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.96.95-2.44 2.1-4.14 2.1-1.63 0-2.14-1.01-4.08-1.01-1.93 0-2.52 1-4.04 1-1.63 0-3.32-1.32-4.43-2.92-2.31-3.31-2.14-8.52.41-11.41 1.27-1.44 2.91-2.36 4.67-2.36 1.34 0 2.37.81 3.51.81 1.12 0 1.83-.81 3.51-.81 1.36 0 2.6.59 3.55 1.57-4.19 1.63-3.51 7.23.44 9.03-.89 2.03-1.9 4.01-3.4 5.99zM12.03 5.11c-.13-2.53 1.95-4.7 4.14-5.11.23 2.53-2.18 4.74-4.14 5.11z"/>
              </svg>
              {t('continue_with_apple')}
            </button>
            <button className="social-btn google" onClick={() => {/* Google logic */}}>
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.8z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.84c.87-2.6 3.3-4.55 6.16-4.55z"/>
              </svg>
              {t('continue_with_google')}
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>{t('dont_have_account')} <Link to="/signup">{t('create_one')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
