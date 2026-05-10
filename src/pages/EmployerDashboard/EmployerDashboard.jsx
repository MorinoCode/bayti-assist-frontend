import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MyWorkerCard from '../../components/MyWorkerCard/MyWorkerCard';
import { Users, Activity, Shield, ArrowRight } from 'lucide-react';
import './EmployerDashboard.css';

const EmployerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  const fetchWorkers = useCallback(async () => {
    try {
      // Fetch both active employments and sent invitations
      const [workersRes, invitationsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/workers/my-workers`, {
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/workers/sent-invitations`, {
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        })
      ]);

      const workersData = await workersRes.json();
      const invitationsData = await invitationsRes.json();

      if (workersRes.ok && invitationsRes.ok) {
        // Map active workers from Employment model to include status
        const activeWorkers = workersData.map(w => ({
          ...w.worker,
          _id: w.worker._id,
          invitationStatus: 'accepted',
          employmentId: w._id
        }));

        // Map pending invitations to match the card structure
        const pendingWorkers = invitationsData.map(inv => ({
          ...inv.worker,
          _id: inv.worker?._id || inv.workerId,
          invitationId: inv._id,
          invitationStatus: inv.status // 'pending' or 'rejected'
        }));

        setWorkers([...activeWorkers, ...pendingWorkers]);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo.token]);

  useEffect(() => {
    const init = async () => {
      await fetchWorkers();
    };
    init();
  }, [fetchWorkers]);

  return (
    <div className="employer-dashboard-v3">
      <div className="bg-decor">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <main className="v3-container">
        <header className="v3-header">
          <div className="user-intro">
            <h1 className="v3-title">
              {t('welcome_back')}, <span className="name">{userInfo.name || t('employer')}</span>
            </h1>
            <p className="v3-desc">Monitoring and managing your household staff made simple.</p>
          </div>
          
          <div className="v3-stats">
            <div className="v3-stat-card">
              <div className="v3-stat-icon-wrap blue">
                <Users size={20} />
              </div>
              <div className="v3-stat-content">
                <span className="v3-stat-val">{workers.length}</span>
                <span className="v3-stat-lbl">Total Staff</span>
              </div>
            </div>
            <div className="v3-stat-card">
              <div className="v3-stat-icon-wrap green">
                <Activity size={20} />
              </div>
              <div className="v3-stat-content">
                <span className="v3-stat-val">{workers.filter(w => w.status === 'online').length}</span>
                <span className="v3-stat-lbl">Active Now</span>
              </div>
            </div>
          </div>
        </header>

        <div className="v3-grid">
          <section className="v3-main">
            <div className="v3-section">
              <div className="v3-section-head">
                <div className="head-title">
                  <h2>Your Staff</h2>
                </div>
                <button className="v3-refresh-btn" onClick={fetchWorkers}>Refresh List</button>
              </div>
              
              <div className="v3-workers-grid">
                {isLoading ? (
                  <div className="v3-loader-container">
                    <div className="v3-loader"></div>
                  </div>
                ) : workers.length > 0 ? (
                  workers.map(worker => (
                    <MyWorkerCard key={worker._id} worker={worker} onRefresh={fetchWorkers} />
                  ))
                ) : (
                  <div className="v3-empty">
                    <div className="v3-empty-art">👥</div>
                    <h4>No workers added</h4>
                    <p>Invite your domestic staff to start tracking their location and managing their access.</p>
                    <button className="v3-primary-btn" onClick={() => navigate('/my-workers')}>
                      Invite Your First Worker
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="v3-side">
            <div className="v3-side-block">
              <div className="v3-block-head">
                <h3>Quick Actions</h3>
              </div>
              <div className="v3-action-stack">
                <button className="v3-side-btn" onClick={() => navigate('/tracking')}>
                  <div className="side-btn-icon">📍</div>
                  <div className="side-btn-text">
                    <strong>Tracking Map</strong>
                    <span>Live location monitoring</span>
                  </div>
                  <ArrowRight size={14} />
                </button>
                <button className="v3-side-btn" onClick={() => navigate('/my-workers')}>
                  <div className="side-btn-icon">✉️</div>
                  <div className="side-btn-text">
                    <strong>New Invite</strong>
                    <span>Send onboarding link</span>
                  </div>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="v3-promo-card">
              <div className="v3-promo-icon">
                <Shield size={28} />
              </div>
              <h4>Security Monitoring</h4>
              <p>All staff connections are secured with end-to-end encryption. Last security audit performed today.</p>
              <div className="v3-promo-tag">System Secure</div>
            </div>

            <div className="v3-mini-card">
              <div className="v3-mini-flex">
                <Shield size={18} />
                <span>End-to-end Encryption Active</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;
