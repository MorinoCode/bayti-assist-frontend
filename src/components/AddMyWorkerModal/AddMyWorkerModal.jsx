import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import Input from '../Input/Input';
import './AddMyWorkerModal.css';

const AddMyWorkerModal = ({ isOpen, onClose, onInvite }) => {
  const { t } = useTranslation();
  const [workerId, setWorkerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onInvite(workerId);
    setIsLoading(false);
    setWorkerId('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{t('add_worker')}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-desc">Enter the Worker ID provided by your staff to send an employment invitation.</p>
          <Input 
            label="Worker ID"
            placeholder="e.g. 64f123abc..."
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            required
          />
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('cancel')}</button>
            <Button type="submit" isLoading={isLoading} className="invite-btn">
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMyWorkerModal;
