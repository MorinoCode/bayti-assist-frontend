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

const MicListener = ({ workerId, workerName, onStop }) => {
  const { t } = useTranslation();
  const pcRef = useRef(null);
  const audioRef = useRef(null);
  const workerSocketId = useRef(null);
  const pendingCandidates = useRef([]);
  const [status, setStatus] = useState('requesting');

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.ontrack = ({ streams }) => {
      if (audioRef.current && streams[0]) {
        audioRef.current.srcObject = streams[0];
        audioRef.current.play().catch(console.error);
        setStatus('live');
      }
    };

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && workerSocketId.current) {
        socket.emit('mic-ice-candidate', { toSocketId: workerSocketId.current, candidate });
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
      socket.emit('mic-answer', { toSocketId: fromSocketId, answer });
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

    socket.on('mic-offer', onOffer);
    socket.on('mic-ice-candidate', onIceCandidate);
    socket.on('mic-stop', onStop);
    socket.on('mic-unavailable', onUnavailable);

    socket.emit('mic-request', { workerId });

    return () => {
      socket.off('mic-offer', onOffer);
      socket.off('mic-ice-candidate', onIceCandidate);
      socket.off('mic-stop', onStop);
      socket.off('mic-unavailable', onUnavailable);
      if (workerSocketId.current) {
        socket.emit('mic-stop', { toSocketId: workerSocketId.current });
      }
      pc.close();
      pcRef.current = null;
    };
  }, [workerId, onStop]);

  const label = {
    requesting: t('requesting_mic'),
    connecting: t('connecting'),
    live: t('listening_to', { name: workerName }),
    permission_denied: `🔒 ${workerName}: mic permission denied`,
    error: `⚠️ Mic unavailable`,
  }[status] ?? t('requesting_mic');

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      background: status === 'live' ? '#14532d' : '#1e293b',
      color: '#fff', borderRadius: 12, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
      transition: 'background 0.3s',
    }}>
      <audio ref={audioRef} />
      <span style={{
        width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
        background: status === 'live' ? '#4ade80' : '#fbbf24',
      }} />
      <span>{label}</span>
      <button onClick={onStop} style={{
        marginLeft: 4, background: 'rgba(255,255,255,0.15)', border: 'none',
        color: '#fff', borderRadius: 6, padding: '3px 10px',
        cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
      }}>
        {t('stop')}
      </button>
    </div>
  );
};

export default MicListener;
