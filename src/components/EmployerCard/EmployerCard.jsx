import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Camera, Mic, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import PermissionModal from '../PermissionModal/PermissionModal';
import { warmCamera, warmMic, warmLocation } from '../../utils/mediaPermissions';
import employerWaiting from '../../assets/employerWaiting.png';
import './EmployerCard.css';

const EmployerCard = ({ employment, onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const employer = employment.employer;
  const perms = employment.permissions || {};

  const handlePermissionClick = (type) => {
    if (perms[type] !== 'granted') {
      setModalType(type);
      setIsModalOpen(true);
    } else {
      updatePermission(type, false);
    }
  };

  const updatePermission = async (type, granted) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${employment._id}/permission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ type, granted })
      });

      if (response.ok) {
        toast.success(t('permission_updated', { status: granted ? t('enabled') : t('revoked') }));
        if (onRefresh) onRefresh();
      }
    } catch {
      toast.error(t('error_update_permission'));
    }
  };

  return (
    <div className="employer-card glass-card active-card animate-fade">
      <div className="card-left">
        <div className="vibrant-avatar">
          <img src={employerWaiting} alt={employer.name} />
          <div className="avatar-overlay active-overlay"></div>
        </div>
      </div>
      <div className="card-right">
        <div className="employer-info-section">
          <div className="id-badge">{t('employer')}</div>
          <h3 className="employer-name">{employment.nickname || employer.name}</h3>
          <p className="employer-status">{t('active_relationship')}</p>
          
          <div className="permission-toggles">
            <button 
              className={`perm-toggle-btn ${perms.liveTracking === 'granted' ? 'active' : ''}`}
              onClick={() => handlePermissionClick('liveTracking')}
              title={t('location_tracking')}
            >
              <MapPin size={18} />
              <span>{t('track')}</span>
            </button>
            <button 
              className={`perm-toggle-btn ${perms.camera === 'granted' ? 'active' : ''}`}
              onClick={() => handlePermissionClick('camera')}
              title={t('camera_access')}
            >
              <Camera size={18} />
              <span>{t('cam_short')}</span>
            </button>
            <button 
              className={`perm-toggle-btn ${perms.microphone === 'granted' ? 'active' : ''}`}
              onClick={() => handlePermissionClick('microphone')}
              title={t('microphone_access')}
            >
              <Mic size={18} />
              <span>{t('mic_short')}</span>
            </button>
          </div>

          <div className="pending-actions">
            <button className="manage-btn" onClick={() => navigate(`/manage-employer/${employment._id}`)}>
              <Settings size={14} />
              {t('manage_settings')}
            </button>
          </div>
        </div>
      </div>

      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType === 'liveTracking' ? 'location' : modalType}
        onConfirm={() => {
          updatePermission(modalType, true);
          // Pre-warm browser-level permission inside the user gesture context so that
          // when the employer triggers a cam/mic/location request the OS dialog has
          // already been resolved and the stream starts instantly.
          if (modalType === 'camera') warmCamera();
          else if (modalType === 'microphone') warmMic();
          else if (modalType === 'liveTracking') warmLocation();
        }}
      />
    </div>
  );
};

export default EmployerCard;
