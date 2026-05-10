import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button/Button';
import manPhone from '../../assets/homepage/employerholdphoneman.png';
import womanPhone from '../../assets/homepage/employerholdphonewoman.png';
import workerManPhone from '../../assets/homepage/workerholdphoneman.png';
import workerWomanPhone from '../../assets/homepage/workerholdphonewoman.png';
import trackGps from '../../assets/homepage/trackgps.png';
import trackCam from '../../assets/homepage/trackcamera.png';
import trackMic from '../../assets/homepage/trackmicrophone.png';
import phoneApps from '../../assets/homepage/phoneapps.png';
import avatar1 from '../../assets/homepage/mangardeber.png';
import avatar2 from '../../assets/homepage/womanhousmaid.png';
import avatar3 from '../../assets/homepage/manhousemaid.png';
import { Check } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [rotation, setRotation] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const width = sliderRef.current.offsetWidth;
      const newSlide = Math.round(scrollLeft / width);
      if (newSlide !== activeSlide) setActiveSlide(newSlide);
    }
  };

  const scrollToSlide = (index) => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: index * sliderRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => {
    const next = (activeSlide + 1) % 4;
    scrollToSlide(next);
  };

  const prevSlide = () => {
    const prev = (activeSlide - 1 + 4) % 4;
    scrollToSlide(prev);
  };

  return (
    <div className={`home-wrapper ${i18n.dir()}`}>
      <div 
        className="home-slider" 
        ref={sliderRef} 
        onScroll={handleScroll}
      >
        {/* Slide 1: Hero */}
        <section className="slide hero-slide">
          <div className="slide-content">
            <div className="hero-text-area">
              <h1 className="hero-title animate-up">
                {t('hero_title')} <br />
                <span className="gradient-text">{t('hero_safety')}</span>
              </h1>
              <p className="hero-subtitle animate-up delay-1">
                {t('hero_subtitle')}
              </p>
              <div className="hero-btns animate-up delay-2">
                <Link to="/login">
                  <Button className="cta-primary">{t('login')}</Button>
                </Link>
                <Link to="/signup">
                  <button className="cta-secondary signup-btn">
                    {t('signup')}
                  </button>
                </Link>
              </div>
              
              <div className="stats-row animate-up delay-3">
                <div className="stat-item">
                  <span className="stat-value">99.9%</span>
                  <span className="stat-label">{t('uptime')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">10ms</span>
                  <span className="stat-label">{t('latency')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{t('secure')}</span>
                  <span className="stat-label">End-to-End</span>
                </div>
              </div>
            </div>

            <div className="hero-visual-area animate-fade">
              <div className="avatar-stack-container">
                <div className="avatar-stack">
                  <div className={`avatar-frame pos-${(0 + rotation) % 3}`}>
                    <img src={avatar1} alt="Staff 1" />
                  </div>
                  <div className={`avatar-frame pos-${(1 + rotation) % 3}`}>
                    <img src={avatar2} alt="Staff 2" />
                  </div>
                  <div className={`avatar-frame pos-${(2 + rotation) % 3}`}>
                    <img src={avatar3} alt="Staff 3" />
                  </div>
                </div>
              </div>
              <div className="visual-glow"></div>
            </div>
          </div>
        </section>

        {/* Slide 2: How it Works */}
        <section className="slide feature-slide">
          <div className="slide-content reverse">
            <div className="feature-text-area">
              <span className="feature-badge">EASY SETUP</span>
              <h2 className="feature-title">
                {t('how_it_works_title')}
              </h2>
              <p className="feature-desc">
                {t('how_it_works_desc')}
              </p>
              
              <div className="feature-points">
                <div className="point">
                  <div className="point-icon">
                    <Check size={18} color="#10b981" strokeWidth={3} />
                  </div>
                  <span>Download the App as an Employee</span>
                </div>
                <div className="point">
                  <div className="point-icon">
                    <Check size={18} color="#10b981" strokeWidth={3} />
                  </div>
                  <span>Install the App on your Worker's Device</span>
                </div>
                <div className="point">
                  <div className="point-icon">
                    <Check size={18} color="#10b981" strokeWidth={3} />
                  </div>
                  <span>Ensure Permissions are Granted</span>
                </div>
              </div>

              <div className="legal-note">
                <p>{t('how_it_works_note')}</p>
              </div>
            </div>

            <div className="feature-visual-area">
              <div className="phones-stack">
                <img src={manPhone} alt="Employer App" className={`phone-img pos-${(0 + rotation) % 2}`} />
                <img src={womanPhone} alt="Employer App" className={`phone-img pos-${(1 + rotation) % 2}`} />
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: Worker Side */}
        <section className="slide worker-slide">
          <div className="slide-content">
            <div className="feature-visual-area">
              <div className="phones-stack">
                <img src={workerManPhone} alt="Worker App" className={`phone-img pos-${(0 + rotation) % 2}`} />
                <img src={workerWomanPhone} alt="Worker App" className={`phone-img pos-${(1 + rotation) % 2}`} />
              </div>
            </div>

            <div className="feature-text-area">
              <span className="feature-badge worker">WORKER APP</span>
              <h2 className="feature-title">
                {t('worker_app_title')}
              </h2>
              <p className="feature-desc">
                {t('worker_app_desc')}
              </p>
              
              <div className="feature-steps">
                <div className="step">
                  <div className="step-num">1</div>
                  <span>Worker installs the app</span>
                </div>
                <div className="step">
                  <div className="step-num">2</div>
                  <span>You enter their Unique ID</span>
                </div>
                <div className="step">
                  <div className="step-num">3</div>
                  <span>Connection is established</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 4: Live Monitoring */}
        <section className="slide monitor-slide">
          <div className="slide-content reverse">
            <div className="feature-text-area">
              <span className="feature-badge monitor">LIVE MONITORING</span>
              <h2 className="feature-title">
                {t('live_monitoring_title')}
              </h2>
              <p className="feature-desc">
                {t('live_monitoring_desc')}
              </p>
              
              <div className="monitor-cards">
                <div className="monitor-card glass-card">
                  <img src={trackGps} alt="GPS" />
                  <span>Real-time GPS</span>
                </div>
                <div className="monitor-card glass-card">
                  <img src={trackMic} alt="Mic" />
                  <span>Ambient Audio</span>
                </div>
                <div className="monitor-card glass-card">
                  <img src={trackCam} alt="Cam" />
                  <span>Live Video</span>
                </div>
              </div>
            </div>

            <div className="feature-visual-area">
              <div className="monitoring-display">
                <div className="radar-circle"></div>
                <img src={phoneApps} alt="Monitoring App" className="monitor-phone-img" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="slider-controls">
        <button className="slider-arrow prev glass-card" onClick={prevSlide}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button className="slider-arrow next glass-card" onClick={nextSlide}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="slider-nav">
        <button className="nav-arrow prev" onClick={prevSlide}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div className="nav-dots">
          {[0, 1, 2, 3].map((idx) => (
            <button 
              key={idx}
              className={`nav-dot ${activeSlide === idx ? 'active' : ''}`}
              onClick={() => scrollToSlide(idx)}
            />
          ))}
        </div>

        <button className="nav-arrow next" onClick={nextSlide}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="background-decor">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
};

export default Home;
