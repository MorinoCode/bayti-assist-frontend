import React from 'react';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import reportHistoryIcon from '../../assets/services/reportHistory.png';
import liveTrackingIcon from '../../assets/services/livetracking.png';
import audioIcon from '../../assets/services/audio.png';
import cameraIcon from '../../assets/services/camnera.png';
import shieldIcon from '../../assets/services/sheld.png';
import privacyIcon from '../../assets/services/privacy.png';
import './Services.css';

const Services = () => {

  const servicesList = [
    {
      id: 1,
      icon: liveTrackingIcon,
      title: 'Precision Live Tracking',
      desc: 'Monitor the exact real-time location of your domestic staff with high-precision GPS technology.',
      color: '#6366f1',
      badge: 'Real-time'
    },
    {
      id: 2,
      icon: audioIcon,
      title: 'Environment Audio',
      desc: 'Ensure safety by listening to the surroundings of your staff with crystal clear audio quality.',
      color: '#10b981',
      badge: 'Audio'
    },
    {
      id: 3,
      icon: cameraIcon,
      title: 'Live Camera Stream',
      desc: 'Access real-time video streams from the device camera to verify situations instantly.',
      color: '#f59e0b',
      badge: 'Video'
    },
    {
      id: 4,
      icon: shieldIcon,
      title: 'Safety Geo-Fencing',
      desc: 'Set virtual boundaries and receive instant alerts if your staff enters or leaves specific zones.',
      color: '#ef4444',
      badge: 'Alerts'
    },
    {
      id: 5,
      icon: reportHistoryIcon,
      title: 'Historical Reports',
      desc: 'Access detailed movement history and behavioral analytics for up to 30 days.',
      color: '#8b5cf6',
      badge: 'History',
      isComingSoon: true
    },
    {
      id: 6,
      icon: privacyIcon,
      title: 'Privacy Controlled',
      desc: 'Advanced permission system where workers control their monitoring status for ultimate privacy.',
      color: '#ec4899',
      badge: 'Privacy'
    }
  ];

  return (
    <div className="services-page animate-fade">
      <div className="services-header">
        <h1 className="services-title">Our Premium <span className="gradient-text">Services</span></h1>
        <p className="services-subtitle">Experience the next generation of domestic staff management and safety monitoring.</p>
      </div>

      <div className="services-grid">
        {servicesList.map((service) => (
          <ServiceCard 
            key={service.id}
            icon={service.icon}
            title={service.title}
            desc={service.desc}
            color={service.color}
            badge={service.badge}
            isComingSoon={service.isComingSoon}
          />
        ))}
      </div>

      <div className="services-footer glass-card">
        <h2>Ready to secure your home?</h2>
        <p>Join thousands of families who trust Bayti Assist for their safety and peace of mind.</p>
        <button className="cta-primary">Get Started Now</button>
      </div>
    </div>
  );
};

export default Services;
