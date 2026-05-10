import React, { useState } from 'react';
import Button from '../Button/Button';
import employerWaiting from '../../assets/employerWaiting.png';
import './EmployerRequestCard.css';

const EmployerRequestCard = ({ request, onRespond }) => {
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
          <div className="id-badge">ID: #{request.employer._id.slice(-5)}</div>
          <h3 className="waiting-title">New Invitation</h3>
          <p className="waiting-msg">{request.employer.name} wants to hire you</p>
          
          <div className="pending-actions horizontal">
            <Button 
              className="accept-btn" 
              onClick={() => handleAction('accepted')}
              isLoading={isLoading}
            >
              Accept
            </Button>
            <button 
              className="decline-btn" 
              onClick={() => handleAction('rejected')}
              disabled={isLoading}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerRequestCard;
