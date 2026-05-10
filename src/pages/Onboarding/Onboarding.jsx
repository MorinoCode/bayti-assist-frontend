import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import welcomeImg from '../../assets/onboarding/welcome1.png';
import workerWelcomeImg from '../../assets/onboarding/worker_welcome.png';
import maleImg from '../../assets/onboarding/male.png';
import femaleImg from '../../assets/onboarding/female.png';
import workerMaleImg from '../../assets/onboarding/worker_male.png';
import workerFemaleImg from '../../assets/onboarding/worker_female.png';
import welcomeCardImg from '../../assets/onboarding/welcome1.png';
import './Onboarding.css';

const countryCodes = [
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
];

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userInfo] = useState(JSON.parse(localStorage.getItem('userInfo')) || {});

  const isWorker = userInfo.role === 'worker';

  // Select assets based on role
  const assets = {
    welcome: isWorker ? workerWelcomeImg : welcomeImg,
    male: isWorker ? workerMaleImg : maleImg,
    female: isWorker ? workerFemaleImg : femaleImg
  };

  const [name, setName] = useState(userInfo.name || '');
  const [email, setEmail] = useState(userInfo.email || '');
  const [phone, setPhone] = useState(userInfo.phone || '');
  const [countryCode, setCountryCode] = useState(userInfo.countryCode || '+965');
  const [gender, setGender] = useState(userInfo.gender || 'male');
  const [isLoading, setIsLoading] = useState(false);

  const isMissingEmail = !userInfo.email;
  const isMissingPhone = !userInfo.phone;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          name: name || userInfo.name || 'User',
          email: isMissingEmail ? (email || undefined) : undefined,
          phone: isMissingPhone ? (phone || undefined) : undefined,
          countryCode: isMissingPhone ? countryCode : undefined,
          gender: gender || 'male',
          avatar: gender || 'male'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      const updatedUser = { ...userInfo, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      if (updatedUser.role === 'employer') {
        navigate('/employer-dashboard');
      } else {
        navigate('/worker-dashboard');
      }
    } catch (error) {
      if (e) alert(error.message);
      // If skipping, just navigate anyway to not block user
      if (!e) {
        if (userInfo.role === 'employer') navigate('/employer-dashboard');
        else navigate('/worker-dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    handleSubmit();
  };

  return (
    <div className="onboarding-page single-layout">
      <div className="onboarding-content">
        <div className="onboarding-card glass-card">
          <div className="onboarding-header-card">
            <h1 className="brand-font">{t('complete_profile')}</h1>
            <p>{t('onboarding_subtitle')}</p>
          </div>
            <form className="onboarding-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <Input
                  label={t('full_name')}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {isMissingEmail && (
                <div className="form-section">
                  <Input
                    label={t('missing_email')}
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {isMissingPhone && (
                <div className="form-section">
                  <div className="phone-input-group">
                    <label>{t('missing_phone')}</label>
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
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <label className="section-label">{t('gender')}</label>
                <div className="gender-cards-container">
                  <div
                    className={`gender-card ${gender === 'male' ? 'active' : ''}`}
                    onClick={() => setGender('male')}
                  >
                    <div className="avatar-wrapper">
                      <img src={assets.male} alt="Male" />
                    </div>
                    <span>{t('male')}</span>
                    <div className="check-badge">✓</div>
                  </div>

                  <div className="onboarding-center-img">
                    <img src={welcomeCardImg} alt="Welcome" />
                  </div>

                  <div
                    className={`gender-card ${gender === 'female' ? 'active' : ''}`}
                    onClick={() => setGender('female')}
                  >
                    <div className="avatar-wrapper">
                      <img src={assets.female} alt="Female" />
                    </div>
                    <span>{t('female')}</span>
                    <div className="check-badge">✓</div>
                  </div>
                </div>
              </div>

              <div className="onboarding-footer">
                <Button type="submit" isLoading={isLoading} className="finish-btn">
                  {t('finish')}
                </Button>
                <button type="button" className="skip-link" onClick={handleSkip}>
                  {t('skip')}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
