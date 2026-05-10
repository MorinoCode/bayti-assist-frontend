import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import workerPending from '../../assets/workerpending.png';
import workerActive from '../../assets/workerActive.png';
import workerMale from '../../assets/onboarding/worker_male.png';
import workerFemale from '../../assets/onboarding/worker_female.png';
import manageIcon from '../../assets/workercard/manageworker.png';
import './MyWorkerCard.css';

const MyWorkerCard = ({ worker, onRefresh }) => {
  const navigate = useNavigate();
  const isAccepted = worker.invitationStatus === 'accepted';
  const isRejected = worker.invitationStatus === 'rejected';
  const isPending = worker.invitationStatus === 'pending' || (!isAccepted && !isRejected && worker.invitationId);

  // Logic to determine which avatar image to show
  let avatarImg = isAccepted ? workerActive : workerPending;

  // Only use specialized avatars if specifically requested or if active one is missing (fallback)
  if (!isAccepted) {
    if (worker.avatar === 'male') avatarImg = workerMale;
    else if (worker.avatar === 'female') avatarImg = workerFemale;
  }

  const handleDeleteRequest = () => {
    toast((t) => (
      <div className="toast-confirm">
        <p>Are you sure you want to delete this request?</p>
        <div className="toast-actions">
          <button className="confirm-yes" onClick={async () => { toast.dismiss(t.id); await performDelete(); }}>Yes</button>
          <button className="confirm-no" onClick={() => toast.dismiss(t.id)}>Cancel</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const performDelete = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers/invitation/${worker.invitationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (response.ok) {
        toast.success('Request deleted');
        if (onRefresh) onRefresh();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete');
      }
    } catch {
      toast.error('Error deleting request');
    }
  };

  // Unified two-column glassmorphism layout for all states
  return (
    <div className={`worker-card glass-card animate-fade ${isPending ? 'pending-card' : ''} ${isRejected ? 'pending-card rejected' : ''} ${isAccepted ? 'active-card' : ''}`}>
      <div className="card-left">
        <div className="vibrant-avatar">
          <img src={avatarImg} alt="Worker" />
          <div className={`avatar-overlay ${isAccepted ? 'active-overlay' : ''}`}></div>
        </div>
      </div>
      <div className="card-right">
        {isAccepted ? (
          <>
            <div className="card-top">
              <h3 className="waiting-title active-title">MANAGE YOUR WORKER</h3>
            </div>
            
            <div className="card-middle">
              <p className="worker-name-display">{worker.name || 'Domestic Staff'}</p>
              <div className="id-badge-new">ID: #{worker.id || worker._id.substring(worker._id.length - 4)}</div>
            </div>

            <div className="card-bottom">
              <button className="manage-btn" onClick={() => navigate(`/manage-worker/${worker._id}`)}>
                <img src={manageIcon} alt="Manage" className="btn-icon-custom" />
                Manage
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="card-top">
              <h3 className={`waiting-title ${isRejected ? 'text-red' : ''}`}>
                {isRejected ? 'INVITATION DECLINED' : 'WAITING FOR APPROVAL'}
              </h3>
            </div>

            <div className="card-middle">
              <p className="worker-name-display">{worker.name || 'Domestic Staff'}</p>
              <div className="id-badge-new">ID: #{worker.id || worker._id.substring(worker._id.length - 4)}</div>
              <p className="waiting-msg">
                {isRejected
                  ? 'Declined by worker'
                  : 'Awaiting confirmation'}
              </p>
            </div>

            <div className="card-bottom">
              <button className="delete-request-btn" onClick={handleDeleteRequest}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                {isRejected ? 'Remove' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyWorkerCard;
