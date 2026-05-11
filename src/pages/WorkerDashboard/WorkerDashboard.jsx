import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import EmployerRequestCard from '../../components/EmployerRequestCard/EmployerRequestCard';
import EmployerCard from '../../components/EmployerCard/EmployerCard';
import { Briefcase, Bell, MapPin, Shield } from 'lucide-react';
import './WorkerDashboard.css';

const WorkerDashboard = () => {
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState([]);
  const [activeEmployments, setActiveEmployments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  const fetchActiveEmployments = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/my-employers`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await response.json();
      if (response.ok) setActiveEmployments(data);
    } catch (error) {
      console.error('Error fetching employers:', error);
    }
  }, [userInfo.token]);

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/invitations`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await response.json();
      if (response.ok) setInvitations(data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo.token]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchInvitations(), fetchActiveEmployments()]);
    };
    init();
  }, [fetchInvitations, fetchActiveEmployments]);

  const handleRespond = async (invitationId, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/invitation/${invitationId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(t('access_request_sent', { type: t(status) }));
        fetchInvitations();
        if (status === 'accepted') fetchActiveEmployments();
      } else {
        const data = await response.json();
        toast.error(data.message || t('failed_respond'));
      }
    } catch {
      toast.error(t('error_responding'));
    }
  };

  return (
    <div className="worker-dashboard-v3">
      <div className="bg-decor">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <main className="v3-container">
        <section className="v3-header">
          <div className="user-intro">
            <h1 className="v3-title">
              {t('welcome_back')}, <span className="name">{userInfo.name || t('worker')}</span>
            </h1>
            <p className="v3-desc">{t('worker_dashboard_desc')}</p>
          </div>

          <div className="v3-stats">
            <div className="v3-stat-card">
              <div className="v3-stat-icon-wrap blue">
                <Briefcase size={20} />
              </div>
              <div className="v3-stat-content">
                <span className="v3-stat-val">{activeEmployments.length}</span>
                <span className="v3-stat-lbl">{t('active_jobs')}</span>
              </div>
            </div>
            <div className="v3-stat-card">
              <div className="v3-stat-icon-wrap amber">
                <Bell size={20} />
              </div>
              <div className="v3-stat-content">
                <span className="v3-stat-val">{invitations.length}</span>
                <span className="v3-stat-lbl">{t('new_invites')}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="v3-grid">
          <div className="v3-main">
            <div className="v3-section">
              <div className="v3-section-head">
                <h2>{t('active_employments')}</h2>
                <button className="v3-refresh-btn" onClick={fetchActiveEmployments}>{t('refresh')}</button>
              </div>
              
              <div className="v3-employers-grid">
                {activeEmployments.length > 0 ? (
                  activeEmployments.map(emp => (
                    <EmployerCard key={emp._id} employment={emp} onRefresh={fetchActiveEmployments} />
                  ))
                ) : (
                  <div className="v3-empty">
                    <div className="v3-empty-art">
                      <Briefcase size={40} />
                    </div>
                    <h4>{t('no_employers_yet')}</h4>
                    <p>{t('invitations_appear_here')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="v3-side">
            <div className="v3-side-block">
              <div className="v3-block-head">
                <h3>{t('invitations')}</h3>
                {invitations.length > 0 && <span className="v3-badge">{invitations.length}</span>}
              </div>
              <div className="v3-block-content scrollable">
                {isLoading ? (
                  <div className="v3-loader"></div>
                ) : invitations.length > 0 ? (
                  invitations.map(inv => (
                    <EmployerRequestCard 
                      key={inv._id} 
                      request={inv} 
                      onRespond={handleRespond} 
                    />
                  ))
                ) : (
                  <div className="v3-side-empty">
                    <p>{t('clean_inbox')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="v3-promo-card">
              <div className="v3-promo-icon">
                <Shield size={28} />
              </div>
              <h4>{t('safety_shield')}</h4>
              <p>{t('safety_shield_desc')}</p>
              <div className="v3-promo-tag">{t('encryption_active')}</div>
            </div>

            <div className="v3-mini-card">
              <div className="v3-mini-flex">
                <MapPin size={18} />
                <span>{t('gps_accuracy')}: {t('high')}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
