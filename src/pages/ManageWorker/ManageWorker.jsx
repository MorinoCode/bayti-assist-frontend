import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Button from '../../components/Button/Button';
import workerActive from '../../assets/workerActive.png';
import './ManageWorker.css';

const ManageWorker = () => {
  const { t } = useTranslation();
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workerData, setWorkerData] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    countryCode: '+965',
    phoneNumber: '',
    role: 'Housemaid',
    avatar: ''
  });

  const countries = useMemo(() => [
    { name: t('country_kuwait'), code: '+965', flag: '🇰🇼' },
    { name: t('country_saudi'), code: '+966', flag: '🇸🇦' },
    { name: t('country_uae'), code: '+971', flag: '🇦🇪' },
    { name: t('country_qatar'), code: '+974', flag: '🇶🇦' },
    { name: t('country_bahrain'), code: '+973', flag: '🇧🇭' },
    { name: t('country_oman'), code: '+968', flag: '🇴🇲' },
    { name: t('country_egypt'), code: '+20', flag: '🇪🇬' },
    { name: t('country_jordan'), code: '+962', flag: '🇯🇴' }
  ], [t]);

  const roles = useMemo(() => [
    { id: 'Housemaid', label: t('role_housemaid') },
    { id: 'Nanny', label: t('role_nanny') },
    { id: 'Caretaker', label: t('role_caretaker') },
    { id: 'Driver', label: t('role_driver') },
    { id: 'Cook', label: t('role_cook') },
    { id: 'Gardener', label: t('role_gardener') },
    { id: 'Security', label: t('role_security') },
    { id: 'Laundry Staff', label: t('role_laundry') },
    { id: 'Personal Assistant', label: t('role_pa') },
    { id: 'Nurse', label: t('role_nurse') }
  ], [t]);

  const fetchWorkerDetails = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${workerId}`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setWorkerData(data);
        const fullPhone = data.phone || '';
        const foundCountry = countries.find(c => fullPhone.startsWith(c.code));
        const countryCode = foundCountry ? foundCountry.code : '+965';
        const phoneNumber = foundCountry ? fullPhone.slice(foundCountry.code.length) : fullPhone;

        setFormData({
          nickname: data.nickname || data.worker?.name || '',
          phone: fullPhone,
          countryCode,
          phoneNumber,
          role: data.role || 'Housemaid',
          avatar: data.avatar || data.worker?.avatar || ''
        });
      }
    } catch {
      toast.error(t('failed_load_details'));
    } finally {
      setLoading(false);
    }
  }, [workerId, countries, t]);

  useEffect(() => {
    const init = async () => {
      await fetchWorkerDetails();
    };
    init();
  }, [fetchWorkerDetails]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${workerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone
        })
      });
      if (response.ok) {
        toast.success(t('details_updated'));
        fetchWorkerDetails();
      }
    } catch {
      toast.error(t('failed_update_details'));
    }
  };

  const requestPermission = async (type) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${workerId}/request-permission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkerData(prev => ({ ...prev, permissions: data.permissions }));
        toast.success(t('access_request_sent', { type: t(type.toLowerCase()) }));
      } else {
        toast.error(t('failed_send_request'));
      }
    } catch {
      toast.error(t('error_send_request'));
    }
  };

  const handleTogglePermission = async (type, granted) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const permissionType = type === 'Map' ? 'liveTracking' : type.toLowerCase();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${workerId}/toggle-permission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ type: permissionType, granted })
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkerData(prev => ({ ...prev, permissions: data.permissions }));
        toast.success(t('permission_updated', { status: granted ? t('enabled') : t('revoked') }));
      }
    } catch {
      toast.error(t('error_update_permission'));
    }
  };

  const handleWhatsApp = () => {
    if (!formData.phone) return toast.error(t('phone_not_set'));
    window.open(`https://wa.me/${formData.phone.replace(/\s+/g, '')}`, '_blank');
  };

  const handleCall = () => {
    if (!formData.phone) return toast.error(t('phone_not_set'));
    window.location.href = `tel:${formData.phone}`;
  };

  if (loading) return <div className="manage-loading">{t('loading')}</div>;
  if (!workerData) return <div className="manage-error">{t('worker_not_found')}</div>;

  return (
    <div className="manage-worker-container animate-fade">
      <div className="manage-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {t('back')}
        </button>
        <div className="header-titles">
          <h1>{t('manage_worker')}</h1>
          <p>{t('worker_id')}: #{workerData.worker?.id || workerData.worker?._id.substring(workerData.worker?._id.length - 6)}</p>
        </div>
      </div>

      <div className="manage-grid">
        <div className="manage-section profile-edit glass-card">
          <div className="section-header-row">
            <h2>{t('worker_profile')}</h2>
            <div className="quick-actions">
              <button 
                onClick={handleWhatsApp} 
                className={`icon-btn whatsapp ${!workerData.phone ? 'disabled' : ''}`} 
                title={workerData.phone ? t('chat') : t('phone_not_set')}
                disabled={!workerData.phone}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </button>
              <button 
                onClick={handleCall} 
                className={`icon-btn call ${!workerData.phone ? 'disabled' : ''}`} 
                title={workerData.phone ? t('call') : t('phone_not_set')}
                disabled={!workerData.phone}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="avatar-selection">
              <img src={workerActive} alt="Avatar" />
              <button type="button" className="edit-avatar-btn">{t('change_photo')}</button>
            </div>

            <div className="form-group">
              <label>{t('worker_nickname')}</label>
              <input 
                type="text" 
                value={formData.nickname} 
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                placeholder={t('nickname_placeholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('telephone_number')}</label>
              <div className="phone-input-group">
                <select 
                  className="country-select"
                  value={formData.countryCode} 
                  onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input 
                  type="tel" 
                  className="phone-number-input"
                  value={formData.phoneNumber} 
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="98765432"
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('assigned_role')}</label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                {roles.map(role => <option key={role.id} value={role.id}>{role.label}</option>)}
              </select>
            </div>

            <Button type="submit" className="save-btn">{t('save_details')}</Button>
          </form>
        </div>

        <div className="manage-section actions-panel">
          <div className="permission-requests glass-card">
            <h2>{t('control_permissions')}</h2>
            <p className="section-desc">{t('permissions_desc')}</p>
            
            <div className="permission-items">
              <div className="permission-item">
                <div className="p-info">
                  <div className="p-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg></div>
                  <div>
                    <span className="p-title">{t('live_map_tracking')}</span>
                    <span className={`p-status ${workerData.permissions?.liveTracking === 'granted' ? 'granted' : ''} ${workerData.permissions?.liveTracking === 'pending' ? 'pending' : ''}`}>
                      {workerData.permissions?.liveTracking === 'granted' ? t('access_granted') : 
                       workerData.permissions?.liveTracking === 'pending' ? t('awaiting_response') : t('access_required')}
                    </span>
                  </div>
                </div>
                {workerData.permissions?.liveTracking === 'granted' ? (
                  <button className="revoke-btn" onClick={() => handleTogglePermission('Map', false)}>{t('revoked')}</button>
                ) : workerData.permissions?.liveTracking === 'pending' ? (
                  <button className="pending-btn" disabled>{t('pending')}...</button>
                ) : (
                  <button className="req-btn" onClick={() => requestPermission('Map')}>{t('request_access')}</button>
                )}
              </div>

              <div className="permission-item">
                <div className="p-info">
                  <div className="p-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg></div>
                  <div>
                    <span className="p-title">{t('remote_microphone')}</span>
                    <span className={`p-status ${workerData.permissions?.microphone === 'granted' ? 'granted' : ''} ${workerData.permissions?.microphone === 'pending' ? 'pending' : ''}`}>
                      {workerData.permissions?.microphone === 'granted' ? t('access_granted') : 
                       workerData.permissions?.microphone === 'pending' ? t('awaiting_response') : t('access_required')}
                    </span>
                  </div>
                </div>
                {workerData.permissions?.microphone === 'granted' ? (
                  <button className="revoke-btn" onClick={() => handleTogglePermission('microphone', false)}>{t('revoked')}</button>
                ) : workerData.permissions?.microphone === 'pending' ? (
                  <button className="pending-btn" disabled>{t('pending')}...</button>
                ) : (
                  <button className="req-btn" onClick={() => requestPermission('Microphone')}>{t('request_access')}</button>
                )}
              </div>

              <div className="permission-item">
                <div className="p-info">
                  <div className="p-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path></svg></div>
                  <div>
                    <span className="p-title">{t('remote_camera')}</span>
                    <span className={`p-status ${workerData.permissions?.camera === 'granted' ? 'granted' : ''} ${workerData.permissions?.camera === 'pending' ? 'pending' : ''}`}>
                      {workerData.permissions?.camera === 'granted' ? t('access_granted') : 
                       workerData.permissions?.camera === 'pending' ? t('awaiting_response') : t('access_required')}
                    </span>
                  </div>
                </div>
                {workerData.permissions?.camera === 'granted' ? (
                  <button className="revoke-btn" onClick={() => handleTogglePermission('camera', false)}>{t('revoked')}</button>
                ) : workerData.permissions?.camera === 'pending' ? (
                  <button className="pending-btn" disabled>{t('pending')}...</button>
                ) : (
                  <button className="req-btn" onClick={() => requestPermission('Camera')}>{t('request_access')}</button>
                )}
              </div>
            </div>
          </div>

          <div className="danger-zone glass-card">
            <h2>{t('termination')}</h2>
            <p className="section-desc">{t('termination_desc')}</p>
            <button className="delete-worker-btn">{t('terminate_employment')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageWorker;
