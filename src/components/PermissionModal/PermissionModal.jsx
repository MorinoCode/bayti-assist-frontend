import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Camera, Mic, X, ShieldCheck, Lock } from 'lucide-react';
import './PermissionModal.css';

const PermissionModal = ({ isOpen, onClose, type, onConfirm }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const config = {
    location: {
      title: t('location_access_title'),
      icon: <MapPin size={48} className="perm-icon location" />,
      description: t('location_access_desc'),
      dataCollected: t('location_data_points'),
      howUsed: t('location_usage'),
      privacy: t('location_privacy')
    },
    camera: {
      title: t('camera_access_title'),
      icon: <Camera size={48} className="perm-icon camera" />,
      description: t('camera_access_desc'),
      dataCollected: t('camera_data_points'),
      howUsed: t('camera_usage'),
      privacy: t('camera_privacy')
    },
    microphone: {
      title: t('mic_access_title'),
      icon: <Mic size={48} className="perm-icon mic" />,
      description: t('mic_access_desc'),
      dataCollected: t('mic_data_points'),
      howUsed: t('mic_usage'),
      privacy: t('mic_privacy')
    }
  };

  const current = config[type] || config.location;

  return (
    <div className="permission-modal-overlay">
      <div className="permission-modal-content glass-card animate-zoom">
        <button className="close-perm-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="perm-header">
          <div className="perm-icon-wrapper">
            {current.icon}
          </div>
          <h2>{current.title}</h2>
        </div>

        <div className="perm-body">
          <p className="main-desc">{current.description}</p>

          <div className="perm-features">
            <div className="feature-item">
              <Lock size={16} className="check-icon" />
              <div>
                <strong>{t('data_collected')}</strong>
                <p>{current.dataCollected}</p>
              </div>
            </div>
            <div className="feature-item">
              <ShieldCheck size={16} className="check-icon" />
              <div>
                <strong>{t('how_used')}</strong>
                <p>{current.howUsed}</p>
              </div>
            </div>
            <div className="feature-item">
              <ShieldCheck size={16} className="check-icon" />
              <div>
                <strong>{t('your_privacy')}</strong>
                <p>{current.privacy}</p>
              </div>
            </div>
          </div>

          <div className="compliance-note">
            <p>{t('compliance_note')} <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">{t('read_privacy_policy')}</a></p>
          </div>
        </div>

        <div className="perm-footer">
          <button className="cancel-perm-btn" onClick={onClose}>{t('decline')}</button>
          <button className="allow-perm-btn" onClick={() => {
            onConfirm(type);
            onClose();
          }}>
            {t('allow_access')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
