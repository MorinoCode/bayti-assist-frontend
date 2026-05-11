import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import employerWaiting from '../../assets/employerWaiting.png';
import './EmployerRequestCard.css';

const EmployerRequestCard = ({ request, onRespond }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (status) => {
    setIsLoading(true);
    await onRespond(request._id, status);
    setIsLoading(false);
  };

  return (
    <div className="employer-request-card glass-card animate-fade">
      <div className="card-left">
        <div className="vibrant-avatar">
          <img src={employerWaiting} alt="Pending Request" />
          <div className="avatar-overlay pending-overlay"></div>
        </div>
      </div>
      
      <div className="card-right">
        <div className="pending-content">
          <div className="id-badge">{t('id_label')}: #{request.employer._id.slice(-5)}</div>
          <h3 className="waiting-title">{t('new_invitation')}</h3>
          <p className="waiting-msg">{t('wants_to_hire', { name: request.employer.name })}</p>
          
          <div className="pending-actions horizontal">
            <Button 
              className="accept-btn" 
              onClick={() => handleAction('accepted')}
              isLoading={isLoading}
            >
              {t('accept')}
            </Button>
            <button 
              className="decline-btn" 
              onClick={() => handleAction('rejected')}
              disabled={isLoading}
            >
              {t('decline')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerRequestCard;
