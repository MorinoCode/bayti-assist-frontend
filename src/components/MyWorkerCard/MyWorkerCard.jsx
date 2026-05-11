import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import workerPending from '../../assets/workerpending.png';
import workerActive from '../../assets/workerActive.png';
import workerMale from '../../assets/onboarding/worker_male.png';
import workerFemale from '../../assets/onboarding/worker_female.png';
import { getAvatarPath } from '../../utils/avatarMapper';
import './MyWorkerCard.css';

const MyWorkerCard = ({ worker, onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAccepted = worker.invitationStatus === 'accepted';
  const isRejected = worker.invitationStatus === 'rejected';
  const isPending = worker.invitationStatus === 'pending' || (!isAccepted && !isRejected && worker.invitationId);

  // Priority: 1. Real Avatar, 2. Mapped Avatar, 3. 3D Character Fallback
  const mappedAvatar = getAvatarPath(worker.avatar, worker.gender, 'worker', worker.name);
  const avatarImg = (worker.avatar && !mappedAvatar.includes('ui-avatars.com')) ? mappedAvatar : (isAccepted ? workerActive : workerPending);

  const handleDeleteRequest = () => {
    toast((toastObj) => (
      <div className="toast-confirm">
        <p>{t('confirm_delete_request')}</p>
        <div className="toast-actions">
          <button className="confirm-yes" onClick={async () => { toast.dismiss(toastObj.id); await performDelete(); }}>{t('yes')}</button>
          <button className="confirm-no" onClick={() => toast.dismiss(toastObj.id)}>{t('cancel')}</button>
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
        toast.success(t('request_deleted'));
        if (onRefresh) onRefresh();
      } else {
        const data = await response.json();
        toast.error(data.message || t('failed_to_delete'));
      }
    } catch {
      toast.error(t('error_deleting_request'));
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
              <h3 className="waiting-title active-title">{t('manage_your_worker')}</h3>
            </div>
            
            <div className="card-middle">
              <p className="worker-name-display">{worker.name || t('domestic_staff')}</p>
              <div className="id-badge-new">ID: #{worker.id || worker._id.substring(worker._id.length - 4)}</div>
            </div>

            <div className="card-bottom">
              <button className="manage-btn" onClick={() => navigate(`/manage-worker/${worker._id}`)}>
                {t('manage')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="card-top">
              <h3 className={`waiting-title ${isRejected ? 'text-red' : ''}`}>
                {isRejected ? t('invitation_declined') : t('waiting_approval')}
              </h3>
            </div>

            <div className="card-middle">
              <p className="worker-name-display">{worker.name || t('domestic_staff')}</p>
              <div className="id-badge-new">ID: #{worker.id || worker._id.substring(worker._id.length - 4)}</div>
              <p className="waiting-msg">
                {isRejected
                  ? t('declined_by_worker')
                  : t('awaiting_confirmation')}
              </p>
            </div>

            <div className="card-bottom">
              <button className="delete-request-btn" onClick={handleDeleteRequest}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                {isRejected ? t('remove') : t('delete')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyWorkerCard;
