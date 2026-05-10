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
        toast.success(`Request ${status}`);
        fetchInvitations();
        if (status === 'accepted') fetchActiveEmployments();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to respond');
      }
    } catch {
      toast.error('Error responding to invitation');
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
            <p className="v3-desc">Manage your work relationships and safety settings in one place.</p>
          </div>

          <div className="v3-stats">
            <div className="v3-stat-card">
              <div className="v3-stat-icon-wrap blue">
                <Briefcase size={20} />
              </div>
              <div className="v3-stat-content">
                <span className="v3-stat-val">{activeEmployments.length}</span>
                <span className="v3-stat-lbl">Active Jobs</span>
              </div>
            </div>
            <div className="v3-stat-card">
              <div className="v3-stat-icon-wrap amber">
                <Bell size={20} />
              </div>
              <div className="v3-stat-content">
                <span className="v3-stat-val">{invitations.length}</span>
                <span className="v3-stat-lbl">New Invites</span>
              </div>
            </div>
          </div>
        </section>

        <div className="v3-grid">
          <div className="v3-main">
            <div className="v3-section">
              <div className="v3-section-head">
                <h2>Active Employments</h2>
                <button className="v3-refresh-btn" onClick={fetchActiveEmployments}>Refresh</button>
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
                    <h4>No employers yet</h4>
                    <p>Invitations will appear on the right once received.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="v3-side">
            <div className="v3-side-block">
              <div className="v3-block-head">
                <h3>Invitations</h3>
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
                    <p>Clean inbox! No new invites.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="v3-promo-card">
              <div className="v3-promo-icon">
                <Shield size={28} />
              </div>
              <h4>Safety Shield</h4>
              <p>Your location and media access are only shared with authorized employers during work hours.</p>
              <div className="v3-promo-tag">End-to-End Encrypted</div>
            </div>

            <div className="v3-mini-card">
              <div className="v3-mini-flex">
                <MapPin size={18} />
                <span>GPS Accuracy: High</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
