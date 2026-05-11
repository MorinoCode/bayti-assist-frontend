import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import MyWorkerCard from '../../components/MyWorkerCard/MyWorkerCard';
import AddMyWorkerModal from '../../components/AddMyWorkerModal/AddMyWorkerModal';
import Button from '../../components/Button/Button';
import addIcon from '../../assets/addicon.png';
import './MyWorkers.css';

const MyWorkers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const [workers, setWorkers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkers = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const headers = { 'Authorization': `Bearer ${userInfo.token}` };
      
      const [activeRes, pendingRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/workers/my-workers`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/workers/sent-invitations`, { headers })
      ]);

      const activeData = await activeRes.json();
      const pendingData = await pendingRes.json();

      if (activeRes.ok && pendingRes.ok) {
        const mappedActive = activeData.map(w => ({
          ...w.worker,
          _id: w.worker._id,
          invitationStatus: 'accepted',
          employmentId: w._id
        }));

        const mappedPending = pendingData.map(inv => ({
          ...inv.worker,
          _id: inv.worker?._id || inv.workerId,
          invitationId: inv._id,
          invitationStatus: inv.status
        }));

        setWorkers([...mappedPending, ...mappedActive]);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInvite = async (workerId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workers/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ workerId })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Invitation sent successfully!');
        setIsModalOpen(false);
        fetchWorkers();
      } else {
        toast.error(data.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting worker:', error);
      toast.error('Network error, please try again');
    }
  };

  useEffect(() => {
    if (userRole !== 'employer') {
      navigate('/');
      return;
    }
    const init = async () => {
      await fetchWorkers();
    };
    init();
  }, [userRole, navigate, fetchWorkers]);

  if (userRole !== 'employer') return null;

  return (
    <div className="my-workers-page animate-fade">
      <div className="workers-container">
        <header className="workers-header">
          <div className="header-text">
            <div className="title-with-icon">
              <Users className="header-icon" size={32} />
              <h1>{t('your_workers')}</h1>
            </div>
            <p>Monitor your team, manage invitations, and oversee domestic operations.</p>
          </div>
          
        </header>

        <section className="workers-main-content">
          {isLoading ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={40} />
              <p>Fetching your team...</p>
            </div>
          ) : workers.length > 0 ? (
            <div className="modern-workers-grid">
              {workers.map(worker => (
                <MyWorkerCard 
                  key={worker._id || worker.id} 
                  worker={worker} 
                  onRefresh={fetchWorkers} 
                />
              ))}
            </div>
          ) : (
            <div className="empty-workers-state glass-card animate-slide-up">
              <div className="empty-icon-wrapper">
                <UserPlus size={48} />
              </div>
              <h2>No Workers Yet</h2>
              <p>Establish your team by inviting workers using their unique ID.</p>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Start Inviting
              </Button>
            </div>
          )}
        </section>

        <button className="add-worker-icon-btn floating" onClick={() => setIsModalOpen(true)} title="Invite Worker">
          <img src={addIcon} alt="Add Worker" />
        </button>

        <AddMyWorkerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onInvite={handleInvite} 
        />
      </div>
    </div>
  );
};

export default MyWorkers;
