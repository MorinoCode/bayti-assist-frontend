import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../../components/Button/Button';
import { User, Mail, Phone, Lock, Trash2, CreditCard, ChevronRight, Camera } from 'lucide-react';
import AvatarModal from '../../components/AvatarModal/AvatarModal';
import { getAvatarPath } from '../../utils/avatarMapper';
import './MyProfile.css';

const MyProfileEmployee = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', gender: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setFormData({ name: data.name, email: data.email, phone: data.phone || '', gender: data.gender || '' });
      }
    } catch {
      toast.error('Failed to load profile');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchProfile();
    };
    init();
  }, [fetchProfile]);

  const getAvatar = (user) => {
    return getAvatarPath(user.avatar, user.gender, user.role, user.name);
  };

  const handleSelectAvatar = async (avatarId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ avatar: avatarId })
      });

      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, avatar: data.avatar });
        localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, avatar: data.avatar }));
        updateAuth();
        toast.success('Avatar updated');
      }
    } catch {
      toast.error('Failed to update avatar');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...updated }));
        setIsEditing(false);
        toast.success('Profile updated');
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword })
      });
      if (res.ok) {
        toast.success('Password changed');
        setShowPasswordModal(false);
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to change password');
      }
    } catch {
      toast.error('Error changing password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This will delete all your data and cannot be undone.')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/delete-account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        toast.success('Account deleted');
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    } catch {
      toast.error('Failed to delete account');
    }
  };

  if (!user) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-container animate-fade">
      <div className="profile-content">
        <header className="profile-top">
          <div className="avatar-section">
            <div className="avatar-wrapper glass-card">
              <img src={getAvatar(user)} alt={user.name} />
              <button className="edit-avatar-btn" onClick={() => setShowAvatarModal(true)}><Camera size={18} /></button>
            </div>
            <div className="user-meta">
              <h1>{user.name}</h1>
              <span className="role-badge">{user.role}</span>
            </div>
          </div>
          <div className="header-actions">
            <Button variant="outline" onClick={() => setShowAvatarModal(true)}>
              {t('select_avatar')}
            </Button>
            <Button variant={isEditing ? 'outline' : 'primary'} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </header>

        <div className="profile-grid">
          <div className="profile-main-col">
            <section className="profile-section glass-card">
              <div className="section-title">
                <User size={20} />
                <h2>Personal Information</h2>
              </div>
              
              <form onSubmit={handleUpdate} className="profile-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label>Full Name</label>
                    <div className={`input-wrapper ${!isEditing ? 'disabled' : ''}`}>
                      <User size={18} />
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <div className={`input-wrapper ${!isEditing ? 'disabled' : ''}`}>
                      <Mail size={18} />
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Phone Number</label>
                    <div className={`input-wrapper ${!isEditing ? 'disabled' : ''}`}>
                      <Phone size={18} />
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Gender</label>
                    <div className={`input-wrapper ${!isEditing ? 'disabled' : ''}`}>
                      <select 
                        value={formData.gender} 
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        disabled={!isEditing}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <Button type="submit" variant="primary">Save Changes</Button>
                  </div>
                )}
              </form>
            </section>

            <section className="profile-section glass-card">
              <div className="section-title">
                <Lock size={20} />
                <h2>Security</h2>
              </div>
              <div className="security-item">
                <div className="security-info">
                  <h3>Password</h3>
                  <p>Last changed 2 months ago</p>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
              </div>
            </section>

            <section className="profile-section glass-card danger-zone">
              <div className="section-title">
                <Trash2 size={20} />
                <h2>Danger Zone</h2>
              </div>
              <div className="danger-item">
                <div className="danger-info">
                  <h3>Delete Account</h3>
                  <p>Permanently remove your account and all associated data.</p>
                </div>
                <Button variant="danger" onClick={handleDeleteAccount}>Delete Account</Button>
              </div>
            </section>
          </div>

          <aside className="profile-side-col">
            <div className="subscription-card glass-card">
              <div className="sub-header">
                <div className="sub-icon">
                  <CreditCard size={24} />
                </div>
                <div className="sub-meta">
                  <h3>Premium Plan</h3>
                  <span>Active until Dec 2026</span>
                </div>
              </div>
              <div className="sub-features">
                <div className="feature-item">
                  <ChevronRight size={16} />
                  <span>Unlimited Worker Tracking</span>
                </div>
                <div className="feature-item">
                  <ChevronRight size={16} />
                  <span>24/7 Support Access</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">Manage Subscription</Button>
            </div>
          </aside>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay animate-fade">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h2>Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={passwords.oldPassword} 
                  onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={passwords.newPassword} 
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwords.confirmPassword} 
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <Button type="submit" variant="primary">Update Password</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAvatarModal && (
        <AvatarModal 
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          onSelect={handleSelectAvatar}
          role={user.role}
          currentAvatar={user.avatar}
        />
      )}
    </div>
  );
};

export default MyProfileEmployee;
