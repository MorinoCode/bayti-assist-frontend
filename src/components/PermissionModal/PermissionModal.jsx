import React from 'react';
import { MapPin, Camera, Mic, X, ShieldCheck, Lock } from 'lucide-react';
import './PermissionModal.css';

const PermissionModal = ({ isOpen, onClose, type, onConfirm }) => {
  if (!isOpen) return null;

  const config = {
    location: {
      title: 'Location Access Required',
      icon: <MapPin size={48} className="perm-icon location" />,
      description: 'This app collects your location data to enable your employer to monitor your real-time position during working hours for safety coordination, attendance verification, and emergency response.',
      dataCollected: 'GPS coordinates (latitude, longitude) and timestamps',
      howUsed: 'Shared with your employer via the Bayti Assist dashboard in real-time. Stored securely for attendance records.',
      benefit: 'Ensures your safety and provides verifiable proof of your working hours and location.',
      privacy: 'Location tracking is only active while the permission is granted. You can revoke access at any time from your Employer Management page. Location data is never shared with third parties.'
    },
    camera: {
      title: 'Camera Access Required',
      icon: <Camera size={48} className="perm-icon camera" />,
      description: 'This app requires camera access to enable your employer to initiate a live video session for visual check-ins and real-time communication.',
      dataCollected: 'Live video stream via peer-to-peer connection',
      howUsed: 'Video is streamed directly to your employer in real-time. Video is NEVER recorded, stored, or transmitted to any server.',
      benefit: 'Enables quick visual communication with your employer for task coordination and safety checks.',
      privacy: 'The camera is only activated when your employer initiates a session. You will see a visible indicator whenever the camera is active. Video streams are encrypted end-to-end using WebRTC (DTLS-SRTP).'
    },
    microphone: {
      title: 'Microphone Access Required',
      icon: <Mic size={48} className="perm-icon mic" />,
      description: 'This app requires microphone access to enable your employer to initiate a live audio session for voice communication and urgent instructions.',
      dataCollected: 'Live audio stream via peer-to-peer connection',
      howUsed: 'Audio is streamed directly to your employer in real-time. Audio is NEVER recorded, stored, or transmitted to any server.',
      benefit: 'Enables clear voice communication for instructions, updates, and emergency situations.',
      privacy: 'The microphone is only activated when your employer initiates a session. You will see a visible indicator whenever audio is being streamed. Audio streams are encrypted end-to-end using WebRTC (DTLS-SRTP).'
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
                <strong>Data Collected</strong>
                <p>{current.dataCollected}</p>
              </div>
            </div>
            <div className="feature-item">
              <ShieldCheck size={16} className="check-icon" />
              <div>
                <strong>How It's Used</strong>
                <p>{current.howUsed}</p>
              </div>
            </div>
            <div className="feature-item">
              <ShieldCheck size={16} className="check-icon" />
              <div>
                <strong>Your Privacy</strong>
                <p>{current.privacy}</p>
              </div>
            </div>
          </div>

          <div className="compliance-note">
            <p>This app complies with Apple App Store and Google Play Store guidelines for sensitive permissions. Your data is protected under applicable privacy and labor laws. You can revoke this permission at any time. <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Read our Privacy Policy</a></p>
          </div>
        </div>

        <div className="perm-footer">
          <button className="cancel-perm-btn" onClick={onClose}>Decline</button>
          <button className="allow-perm-btn" onClick={() => {
            onConfirm(type);
            onClose();
          }}>
            Allow Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
