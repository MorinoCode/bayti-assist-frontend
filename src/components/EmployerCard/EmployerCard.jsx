import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Camera, Mic, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import PermissionModal from '../PermissionModal/PermissionModal';
import employerWaiting from '../../assets/employerWaiting.png';
import './EmployerCard.css';

const EmployerCard = ({ employment, onRefresh }) => {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const employer = employment.employer;
  const perms = employment.permissions || {};

  const handlePermissionClick = (type) => {
    // Only show modal if permission is not already granted
    if (perms[type] !== 'granted') {
      setModalType(type);
      setIsModalOpen(true);
    } else {
      // Toggle off logic
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
        toast.success(`${type} permission ${granted ? 'granted' : 'revoked'}`);
        if (onRefresh) onRefresh();
      }
    } catch {
      toast.error('Failed to update permission');
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
          <div className="id-badge">Employer</div>
          <h3 className="employer-name">{employment.nickname || employer.name}</h3>
          <p className="employer-status">Active Relationship</p>
          
          <div className="permission-toggles">
            <button 
              className={`perm-toggle-btn ${perms.liveTracking === 'granted' ? 'active' : ''}`}
              onClick={() => handlePermissionClick('liveTracking')}
              title="Location Tracking"
            >
              <MapPin size={18} />
              <span>Map</span>
            </button>
            <button 
              className={`perm-toggle-btn ${perms.camera === 'granted' ? 'active' : ''}`}
              onClick={() => handlePermissionClick('camera')}
              title="Camera Access"
            >
              <Camera size={18} />
              <span>Cam</span>
            </button>
            <button 
              className={`perm-toggle-btn ${perms.microphone === 'granted' ? 'active' : ''}`}
              onClick={() => handlePermissionClick('microphone')}
              title="Microphone Access"
            >
              <Mic size={18} />
              <span>Mic</span>
            </button>
          </div>

          <div className="pending-actions">
            <button className="manage-btn" onClick={() => navigate(`/manage-employer/${employment._id}`)}>
              <Settings size={14} />
              Manage Settings
            </button>
          </div>
        </div>
      </div>

      <PermissionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType === 'liveTracking' ? 'location' : modalType}
        onConfirm={() => updatePermission(modalType, true)}
      />
    </div>
  );
};

export default EmployerCard;
