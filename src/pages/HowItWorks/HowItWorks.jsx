import React, { useState, useRef } from 'react';
import appInstallIcon from '../../assets/howitworks/appinstall.png';
import step2Icon from '../../assets/howitworks/step2.png';
import './HowItWorks.css';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sliderRef = useRef(null);

  const steps = [
    {
      id: 0,
      title: "1. Create Your Profile",
      desc: "Sign up as an Employer or Worker. Workers set their basic details while Employers prepare their dashboard.",
      icon: "1",
      image: appInstallIcon
    },
    {
      id: 1,
      title: "2. Connect with Workers",
      desc: "Employers add workers using their unique ID. A secure request is sent, ensuring mutual consent before any tracking begins.",
      icon: "2",
      image: step2Icon
    },
    {
      id: 2,
      title: "3. Real-Time Monitoring",
      desc: "Once connected, employers can view live locations, listen to surroundings, and access camera streams with high precision.",
      icon: "3",
      image: "https://cdn-icons-png.flaticon.com/512/854/854878.png"
    },
    {
      id: 3,
      title: "4. Total Privacy Control",
      desc: "Workers have full control. They can pause tracking at any time, ensuring their personal space and privacy are respected.",
      icon: "4",
      image: "https://cdn-icons-png.flaticon.com/512/2592/2592317.png"
    }
  ];

  const handleScroll = (e) => {
    const scrollPos = e.target.scrollLeft;
    const stepWidth = e.target.offsetWidth;
    const newStep = Math.round(scrollPos / stepWidth);
    if (newStep !== activeStep) setActiveStep(newStep);
  };

  const scrollToStep = (index) => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: index * sliderRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="how-page animate-fade">
      <div className="how-header">
        <h1 className="how-title">How It <span className="gradient-text">Works</span></h1>
        <p className="how-subtitle">Follow these simple steps to secure your household with Bayti Assist.</p>
      </div>

      <div className="how-slider-container">
        <div className="how-slider" ref={sliderRef} onScroll={handleScroll}>
          {steps.map((step) => (
            <div key={step.id} className="how-step-slide">
              <div className="step-content-card glass-card">
                <div className="step-icon-bg">{step.icon}</div>
                <div className="step-visual">
                  <img src={step.image} alt={step.title} className="step-img" />
                </div>
                <div className="step-text">
                  <h2>{step.title}</h2>
                  <p>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="how-nav">
          {steps.map((_, idx) => (
            <button 
              key={idx} 
              className={`how-dot ${activeStep === idx ? 'active' : ''}`}
              onClick={() => scrollToStep(idx)}
            />
          ))}
        </div>

        <div className="how-controls">
          <button 
            className="how-btn-prev glass-card" 
            onClick={() => scrollToStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
          >
            ←
          </button>
          <button 
            className="how-btn-next glass-card" 
            onClick={() => scrollToStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
          >
            →
          </button>
        </div>
      </div>

      <div className="how-footer animate-up">
        <button className="cta-primary">Ready to Start?</button>
      </div>
    </div>
  );
};

export default HowItWorks;
