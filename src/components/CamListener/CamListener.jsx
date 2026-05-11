import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { socket } from '../../socket';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  ...(import.meta.env.VITE_TURN_URL ? [{
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  }] : []),
];

const CamListener = ({ workerId, workerName, onStop }) => {
  const { t } = useTranslation();
  const pcRef = useRef(null);
  const videoRef = useRef(null);
  const workerSocketId = useRef(null);
  const pendingCandidates = useRef([]);
  const [status, setStatus] = useState('requesting');

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.ontrack = ({ streams }) => {
      if (videoRef.current && streams[0]) {
        videoRef.current.srcObject = streams[0];
        videoRef.current.play().catch(console.error);
        setStatus('live');
      }
    };

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && workerSocketId.current) {
        socket.emit('cam-ice-candidate', { toSocketId: workerSocketId.current, candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        onStop();
      }
    };

    const onOffer = async ({ offer, fromSocketId }) => {
      workerSocketId.current = fromSocketId;
      setStatus('connecting');
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      for (const c of pendingCandidates.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      }
      pendingCandidates.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('cam-answer', { toSocketId: fromSocketId, answer });
    };

    const onIceCandidate = async ({ candidate }) => {
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    const onUnavailable = ({ reason }) => {
      setStatus(reason === 'permission_denied' ? 'permission_denied' : 'error');
    };

    socket.on('cam-offer', onOffer);
    socket.on('cam-ice-candidate', onIceCandidate);
    socket.on('cam-stop', onStop);
    socket.on('cam-unavailable', onUnavailable);

    socket.emit('cam-request', { workerId });

    return () => {
      socket.off('cam-offer', onOffer);
      socket.off('cam-ice-candidate', onIceCandidate);
      socket.off('cam-stop', onStop);
      socket.off('cam-unavailable', onUnavailable);
      if (workerSocketId.current) {
        socket.emit('cam-stop', { toSocketId: workerSocketId.current });
      }
      pc.close();
      pcRef.current = null;
    };
  }, [workerId, onStop]);

  return (
    <div className="cam-listener-overlay animate-fade">
      <div className="cam-listener-card glass-card">
        <div className="cam-header">
          <div className="header-left">
            <span className={`pulse-dot ${status === 'live' ? 'live' : 'requesting'}`} />
            <h3>{status === 'live' ? t('live_stream') : t('establishing_connection')}</h3>
          </div>
          <button className="close-btn" onClick={onStop}>&times;</button>
        </div>
        
        <div className="video-container">
          {status !== 'live' && (
            <div className="video-placeholder">
              {status === 'permission_denied' || status === 'error' ? (
                <>
                  <span style={{ fontSize: 36 }}>
                    {status === 'permission_denied' ? '🔒' : '⚠️'}
                  </span>
                  <p style={{ color: '#f87171', margin: 0 }}>
                    {status === 'permission_denied'
                      ? t('camera_permission_denied_worker')
                      : t('camera_unavailable')}
                  </p>
                  <button
                    onClick={onStop}
                    style={{
                      marginTop: 8,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      borderRadius: 8,
                      padding: '6px 16px',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {t('close')}
                  </button>
                </>
              ) : (
                <>
                  <div className="loader"></div>
                  <p>{status === 'requesting' ? t('requesting_camera') : t('connecting')}</p>
                  <span>{t('waiting_for_respond', { name: workerName })}</span>
                </>
              )}
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={status === 'live' ? 'active' : ''} 
          />
        </div>

        <div className="cam-footer">
          <span className="worker-name">{t('worker')}: {workerName}</span>
          <button className="stop-btn" onClick={onStop}>{t('stop_live_view')}</button>
        </div>
      </div>

      <style>{`
        .cam-listener-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 20px;
        }
        .cam-listener-card {
          width: 100%;
          max-width: 600px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .cam-header {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-left h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        .pulse-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .pulse-dot.live {
          background: #ef4444;
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          animation: pulse-red 2s infinite;
        }
        .pulse-dot.requesting {
          background: #fbbf24;
          animation: pulse-yellow 2s infinite;
        }
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 24px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-btn:hover { color: #fff; }
        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: #000;
        }
        .video-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          gap: 16px;
        }
        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: none;
        }
        video.active {
          display: block;
        }
        .cam-footer {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.05);
        }
        .worker-name {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }
        .stop-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .stop-btn:hover { background: #dc2626; }
      `}</style>
    </div>
  );
};

export default CamListener;
