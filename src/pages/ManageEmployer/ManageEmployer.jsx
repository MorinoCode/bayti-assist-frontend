import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Mic, Camera, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';
import employerWaiting from '../../assets/employerWaiting.png';
import { getAvatarPath } from '../../utils/avatarMapper';
import './ManageEmployer.css';

const ManageEmployer = () => {
  const { employmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employment, setEmployment] = useState(null);
  const [showAllowModal, setShowAllowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const fetchEmploymentDetails = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${employmentId}`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setEmployment(data);
      }
    } catch {
      toast.error('Failed to load employer details');
    } finally {
      setLoading(false);
    }
  }, [employmentId]);

  useEffect(() => {
    const init = async () => {
      await fetchEmploymentDetails();
    };
    init();
  }, [fetchEmploymentDetails]);

  const handleGrantAll = async () => {
    if (!consentChecked) {
      toast.error('Please review and accept the data sharing terms');
      return;
    }
    setProcessing(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${employmentId}/permission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ grantAll: true, granted: true })
      });

      if (response.ok) {
        toast.success('All permissions granted to employer');
        setShowAllowModal(false);
        setConsentChecked(false);
        fetchEmploymentDetails();
      }
    } catch {
      toast.error('Error updating permissions');
    } finally {
      setProcessing(false);
    }
  };

  const handleDenyAll = async () => {
    setProcessing(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const permTypes = ['liveTracking', 'microphone', 'camera'];
      for (const type of permTypes) {
        await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${employmentId}/permission`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          },
          body: JSON.stringify({ type, granted: false })
        });
      }
      toast.success('All permissions denied');
      setShowAllowModal(false);
      fetchEmploymentDetails();
    } catch {
      toast.error('Error updating permissions');
    } finally {
      setProcessing(false);
    }
  };

  const handleGrantSingle = async (type) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${employmentId}/permission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ type, granted: true })
      });

      if (response.ok) {
        toast.success('Permission granted');
        fetchEmploymentDetails();
      }
    } catch {
      toast.error('Error updating permission');
    }
  };

  const handleRevokeSingle = async (type) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${employmentId}/permission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ type, granted: false })
      });

      if (response.ok) {
        toast.success('Permission revoked');
        fetchEmploymentDetails();
      }
    } catch {
      toast.error('Error updating permission');
    }
  };

  const handleDenySingle = async (type) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${employmentId}/permission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ type, granted: false })
      });

      if (response.ok) {
        toast.success('Permission denied');
        fetchEmploymentDetails();
      }
    } catch {
      toast.error('Error updating permission');
    }
  };

  if (loading) return <div className="manage-loading">Loading...</div>;
  if (!employment) return <div className="manage-error">Employment record not found</div>;

  const perms = employment.permissions || {};
  const hasPending = perms.liveTracking === 'pending' || perms.microphone === 'pending' || perms.camera === 'pending';
  const allGranted = perms.liveTracking === 'granted' && perms.microphone === 'granted' && perms.camera === 'granted';
  const anyGranted = perms.liveTracking === 'granted' || perms.microphone === 'granted' || perms.camera === 'granted';

  const permissionItems = [
    {
      key: 'liveTracking',
      label: 'Live Location Tracking',
      icon: <MapPin size={20} />,
      desc: 'Share your real-time GPS location with your employer during working hours for safety coordination and attendance verification.',
      dataCollected: 'GPS coordinates (latitude, longitude), timestamp'
    },
    {
      key: 'microphone',
      label: 'Microphone Access',
      icon: <Mic size={20} />,
      desc: 'Allow your employer to initiate a one-way audio session for voice communication. Audio is streamed live and is never recorded or stored.',
      dataCollected: 'Live audio stream (not recorded, not stored)'
    },
    {
      key: 'camera',
      label: 'Camera Access',
      icon: <Camera size={20} />,
      desc: 'Allow your employer to initiate a one-way video session for visual check-ins. Video is streamed live and is never recorded or stored.',
      dataCollected: 'Live video stream (not recorded, not stored)'
    },
  ];

  return (
    <div className="manage-employer-container animate-fade">
      <div className="manage-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <h1>Employer Management</h1>
      </div>

      <div className="manage-grid">
        <div className="manage-section employer-info glass-card">
          <h2>Employer Profile</h2>
          <div className="profile-content">
            <div className="profile-display">
              <div className="employer-avatar-wrapper">
                {employment.employer?.avatar ? (
                  <img src={getAvatarPath(employment.employer.avatar, employment.employer.gender, 'employer', employment.employer.name)} alt="Employer" />
                ) : (
                  <img src={employerWaiting} alt="Employer" />
                )}
              </div>
              <div className="info-text">
                <h3>{employment.employer?.name || 'Your Employer'}</h3>
                <p className="role-label">Employer</p>
                <p className="email-label">{employment.employer?.email}</p>
                {employment.employer?.phone && <p className="phone-label">{employment.employer.phone}</p>}
              </div>
            </div>

            <div className="contact-buttons">
              <button className="contact-btn phone"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Call</button>
              <button className="contact-btn whatsapp"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> WhatsApp</button>
            </div>
          </div>
        </div>

        <div className="manage-section permissions-control glass-card">
          <h2>Tracking & Privacy Permissions</h2>
          <p className="section-desc">Control what your employer can access on your device. All data sharing requires your explicit consent and can be revoked at any time.</p>

          {hasPending && (
            <div className="pending-request-banner">
              <div className="banner-icon"><AlertTriangle size={24} color="#f59e0b" /></div>
              <div className="banner-text">
                <h4>Permission Request from Employer</h4>
                <p>Your employer has requested access to device features. Review each permission below or allow all at once.</p>
              </div>
              <div className="banner-actions">
                <button className="allow-all-btn" onClick={() => setShowAllowModal(true)}>Review & Allow All</button>
                <button className="deny-all-btn" onClick={handleDenyAll} disabled={processing}>Deny All</button>
              </div>
            </div>
          )}

          <div className="permission-manage-list">
            {permissionItems.map(item => {
              const status = perms[item.key];
              if (status === 'none') return null;

              return (
                <div className={`p-manage-item ${status}`} key={item.key}>
                  <div className="p-icon-col">
                    {item.icon}
                  </div>
                  <div className="p-meta">
                    <span className="p-name">{item.label}</span>
                    <span className="p-desc">{item.desc}</span>
                    <span className="p-data-note"><Lock size={10} /> Data: {item.dataCollected}</span>
                  </div>
                  <div className="p-status-col">
                    {status === 'granted' ? (
                      <>
                        <span className="p-badge granted"><ShieldCheck size={14} /> Active</span>
                        <button className="revoke-btn" onClick={() => handleRevokeSingle(item.key)}>Revoke</button>
                      </>
                    ) : status === 'pending' ? (
                      <div className="p-pending-actions">
                        <button className="grant-single-btn" onClick={() => handleGrantSingle(item.key)}>Allow</button>
                        <button className="deny-single-btn" onClick={() => handleDenySingle(item.key)}>Deny</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {!hasPending && !anyGranted && (
              <div className="no-permissions-placeholder glass-card">
                <p>No active or pending permission requests from this employer.</p>
              </div>
            )}

            {allGranted && (
              <div className="all-granted-info">
                <ShieldCheck size={20} />
                <span>All permissions active. You can revoke any permission at any time from this page.</span>
              </div>
            )}
          </div>

          <div className="privacy-footer-note">
            <Lock size={14} />
            <span>Your privacy is protected under applicable labor laws. Audio and video are streamed in real-time only and are <strong>never recorded or stored</strong>. Location data is used solely for safety coordination. <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></span>
          </div>
        </div>
      </div>

      {showAllowModal && (
        <div className="permission-modal-overlay">
          <div className="permission-modal-content glass-card animate-zoom">
            <button className="close-perm-btn" onClick={() => { setShowAllowModal(false); setConsentChecked(false); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="perm-header">
              <div className="perm-icon-wrapper">
                <ShieldCheck size={48} className="perm-icon location" />
              </div>
              <h2>Data Sharing Consent</h2>
            </div>

            <div className="perm-body">
              <p className="main-desc">By granting these permissions, you agree to share the following data with your employer (<strong>{employment.employer?.name}</strong>) through the Bayti Assist app:</p>

              <div className="perm-features">
                <div className="feature-item">
                  <MapPin size={18} className="check-icon" />
                  <div>
                    <strong>Location Data</strong>
                    <p>Your real-time GPS coordinates will be shared with your employer while location tracking is active. This is used for safety coordination and attendance verification during working hours.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <Mic size={18} className="check-icon" />
                  <div>
                    <strong>Microphone Access</strong>
                    <p>Your employer can initiate a live audio session. Audio is streamed in real-time via encrypted peer-to-peer connection and is <strong>never recorded or stored</strong> on any server.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <Camera size={18} className="check-icon" />
                  <div>
                    <strong>Camera Access</strong>
                    <p>Your employer can initiate a live video session. Video is streamed in real-time via encrypted peer-to-peer connection and is <strong>never recorded or stored</strong> on any server.</p>
                  </div>
                </div>
              </div>

              <div className="compliance-note">
                <h4>Your Rights</h4>
                <ul>
                  <li>You can <strong>revoke any permission at any time</strong> from this page</li>
                  <li>All streams use <strong>end-to-end encryption</strong> (WebRTC DTLS-SRTP)</li>
                  <li>Audio and video are <strong>never recorded or stored</strong></li>
                  <li>Location data is stored securely and accessible only to your employer</li>
                  <li>You are protected under applicable <strong>labor and privacy laws</strong></li>
                </ul>
              </div>

              <label className="consent-checkbox">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                />
                <span>I understand and consent to sharing the above data with my employer. I acknowledge that I can revoke these permissions at any time.</span>
              </label>
            </div>

            <div className="perm-footer">
              <button className="cancel-perm-btn" onClick={() => { setShowAllowModal(false); setConsentChecked(false); }}>Decline</button>
              <button
                className="allow-perm-btn"
                onClick={handleGrantAll}
                disabled={processing || !consentChecked}
              >
                {processing ? 'Granting...' : 'I Agree — Grant All Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployer;
