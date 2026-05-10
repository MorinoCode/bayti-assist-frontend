import React from 'react';
import { useTranslation } from 'react-i18next';
import './AvatarModal.css';

// Worker Avatars
import worker1 from '../../assets/avatars/worker/workeravatar2.png';
import worker2 from '../../assets/avatars/worker/workeravatar3.png';
import worker3 from '../../assets/avatars/worker/workeravatar4.png';
import worker4 from '../../assets/avatars/worker/workeravatar5.png';
import worker5 from '../../assets/avatars/worker/workeravatar6.png';
import worker6 from '../../assets/avatars/worker/workeravatar7.png';
import worker7 from '../../assets/avatars/worker/workeravatar8.png';
import worker8 from '../../assets/avatars/worker/workeravatar9.png';
import worker9 from '../../assets/avatars/worker/workeravatar10.png';
import workerMale from '../../assets/avatars/worker/worker_male.png';
import workerFemale from '../../assets/avatars/worker/worker_female.png';

// Employee Avatars
import emp1 from '../../assets/avatars/employee/employeavatar2.png';
import emp2 from '../../assets/avatars/employee/employeavatar3.png';
import emp3 from '../../assets/avatars/employee/employeavatar4.png';
import emp4 from '../../assets/avatars/employee/employeavatar5.png';
import empMale from '../../assets/avatars/employee/male.png';
import empFemale from '../../assets/avatars/employee/female.png';

const AvatarModal = ({ isOpen, onClose, onSelect, role, currentAvatar }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const avatars = role === 'worker' ? [
    { id: 'worker_male', img: workerMale },
    { id: 'worker_female', img: workerFemale },
    { id: 'worker2', img: worker1 },
    { id: 'worker3', img: worker2 },
    { id: 'worker4', img: worker3 },
    { id: 'worker5', img: worker4 },
    { id: 'worker6', img: worker5 },
    { id: 'worker7', img: worker6 },
    { id: 'worker8', img: worker7 },
    { id: 'worker9', img: worker8 },
    { id: 'worker10', img: worker9 },
  ] : [
    { id: 'male', img: empMale },
    { id: 'female', img: empFemale },
    { id: 'emp2', img: emp1 },
    { id: 'emp3', img: emp2 },
    { id: 'emp4', img: emp3 },
    { id: 'emp5', img: emp4 },
  ];

  return (
    <div className="avatar-modal-overlay animate-fade" onClick={onClose}>
      <div className="avatar-modal-content glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('select_avatar')}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="avatar-grid">
          {avatars.map((avatar) => (
            <div 
              key={avatar.id}
              className={`avatar-option ${currentAvatar === avatar.id ? 'active' : ''}`}
              onClick={() => {
                onSelect(avatar.id);
                onClose();
              }}
            >
              <img src={avatar.img} alt="Avatar option" />
              <div className="select-overlay">
                <span>Select</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
