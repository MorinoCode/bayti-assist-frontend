import React from 'react';
import './ServiceCard.css';

const ServiceCard = ({ icon, title, desc, color, badge, isComingSoon }) => {
  const isImageIcon = typeof icon === 'string' && (icon.includes('data:image') || icon.includes('/assets/') || icon.includes('.png') || icon.includes('.svg'));

  return (
    <div className="service-card-v2 glass-card">
      <div className="service-card-left" style={{ '--accent-color': color }}>
        <div className="service-card-icon-main">
          {isImageIcon ? <img src={icon} alt={title} className="service-icon-img" /> : icon}
        </div>
        <div className="service-card-diagonal"></div>
      </div>
      
      <div className="service-card-right">
        <div className="service-card-meta">
          <span className="service-badge-v2" style={{ backgroundColor: color }}>{badge || 'Premium'}</span>
          {isComingSoon && <span className="coming-soon-badge">Soon</span>}
        </div>
        
        <h3 className="service-title-v2">{title}</h3>
        <p className="service-desc-v2">{desc}</p>
      </div>
    </div>
  );
};

export default ServiceCard;
