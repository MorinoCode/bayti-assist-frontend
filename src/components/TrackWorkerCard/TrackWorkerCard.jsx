import whatsappIcon from '../../assets/whatsapplogo.png';
import gpsIcon from '../../assets/homepage/trackgps.png';
import micIcon from '../../assets/homepage/trackmicrophone.png';
import camIcon from '../../assets/homepage/trackcamera.png';
import { getAvatarPath } from '../../utils/avatarMapper';
import './TrackWorkerCard.css';

const TrackWorkerCard = ({ workerData, onTrack, onMic, onCam }) => {
  const { worker, nickname, permissions, phone: customPhone } = workerData;
  const phone = customPhone || worker?.phone;
  const isOnline = worker?.status === 'online';

  // Use the standard project mapper for avatars
  const avatarImg = getAvatarPath(worker?.avatar, worker?.gender, worker?.role, nickname || worker?.name);

  const handleWhatsApp = () => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="track-worker-card glass-card animate-fade">
      <div className="worker-visual-modern">
        <div className="avatar-container">
          <img src={avatarImg} alt={nickname || worker?.name} />
          <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
        </div>
      </div>

      <div className="worker-identity">
        <h3 className="worker-name-modern">{nickname || worker?.name || 'Worker'}</h3>
        <p className="worker-id-modern">ID: #{worker?._id?.slice(-6).toUpperCase() || 'BB6AC'}</p>
      </div>

      <div className="tracking-actions-modern">
        <button 
          className={`action-tile ${permissions?.liveTracking !== 'granted' ? 'disabled' : ''}`} 
          onClick={onTrack}
          disabled={permissions?.liveTracking !== 'granted'}
        >
          <img src={gpsIcon} alt="Track" className="tile-icon" />
          <span>TRACK</span>
        </button>
        
        <button 
          className={`action-tile ${!phone ? 'disabled' : ''}`} 
          onClick={handleWhatsApp}
          disabled={!phone}
        >
          <img src={whatsappIcon} alt="Chat" className="tile-icon" />
          <span>CHAT</span>
        </button>

        <button 
          className={`action-tile ${permissions?.microphone !== 'granted' ? 'disabled' : ''}`} 
          onClick={onMic}
          disabled={permissions?.microphone !== 'granted'}
        >
          <img src={micIcon} alt="Mic" className="tile-icon" />
          <span>MIC</span>
        </button>

        <button 
          className={`action-tile ${permissions?.camera !== 'granted' ? 'disabled' : ''}`} 
          onClick={onCam}
          disabled={permissions?.camera !== 'granted'}
        >
          <img src={camIcon} alt="Camera" className="tile-icon" />
          <span>CAMERA</span>
        </button>
      </div>
    </div>
  );
};

export default TrackWorkerCard;
