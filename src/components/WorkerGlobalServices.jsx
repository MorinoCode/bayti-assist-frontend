import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LocationBroadcaster from './LocationBroadcaster';
import { useMicBroadcaster } from '../hooks/useMicBroadcaster';
import { useCamBroadcaster } from '../hooks/useCamBroadcaster';
import { warmCamera, warmMic, queryPermission } from '../utils/mediaPermissions';
import { socket } from '../socket';
import toast from 'react-hot-toast';

const WorkerGlobalServices = () => {
  const { user } = useAuth();
  const [employments, setEmployments] = useState([]);
  const [prewarmTypes, setPrewarmTypes] = useState([]);
  const prewarmCheckedRef = useRef(false);
  const isWorker = user?.role === 'worker';

  const { isMicActive } = useMicBroadcaster(isWorker);
  const { isCamActive } = useCamBroadcaster(isWorker);

  const checkBrowserPermissions = useCallback(async (emps) => {
    if (prewarmCheckedRef.current) return;
    prewarmCheckedRef.current = true;

    const hasCam = emps.some(e => e.permissions?.camera === 'granted');
    const hasMic = emps.some(e => e.permissions?.microphone === 'granted');
    if (!hasCam && !hasMic) return;

    const needed = [];
    if (hasCam) {
      const state = await queryPermission('camera');
      if (state === 'prompt') needed.push('camera');
    }
    if (hasMic) {
      const state = await queryPermission('microphone');
      if (state === 'prompt') needed.push('microphone');
    }
    if (needed.length > 0) setPrewarmTypes(needed);
  }, []);

  const fetchEmployments = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo?.token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workers/my-employers`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployments(data);
        checkBrowserPermissions(data);
      }
    } catch (err) {
      console.error('[WorkerGlobalServices] Failed to fetch employments:', err);
    }
  }, [checkBrowserPermissions]);

  useEffect(() => {
    if (!isWorker) return;

    if (!socket.connected) socket.connect();
    fetchEmployments();

    const refreshInterval = setInterval(fetchEmployments, 60000);

    return () => clearInterval(refreshInterval);
  }, [isWorker, fetchEmployments]);

  useEffect(() => {
    if (!isWorker) return;
    if (isMicActive) {
      toast('🎤 Your employer is listening to microphone', { duration: 0, id: 'global-mic-active' });
    } else {
      toast.dismiss('global-mic-active');
    }
  }, [isMicActive, isWorker]);

  useEffect(() => {
    if (!isWorker) return;
    if (isCamActive) {
      toast('📷 Your employer is viewing live camera', { duration: 0, id: 'global-cam-active' });
    } else {
      toast.dismiss('global-cam-active');
    }
  }, [isCamActive, isWorker]);

  const handlePrewarm = async () => {
    const fns = prewarmTypes.map(t => (t === 'camera' ? warmCamera() : warmMic()));
    await Promise.all(fns);
    setPrewarmTypes([]);
  };

  if (!isWorker) return null;

  return (
    <>
      <LocationBroadcaster employments={employments} />
      {prewarmTypes.length > 0 && (
        <div
          onClick={handlePrewarm}
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1200,
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: 14,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            maxWidth: 340,
            width: 'calc(100% - 48px)',
          }}
        >
          <span style={{ fontSize: 20 }}>
            {prewarmTypes.includes('camera') ? '📷' : '🎤'}
          </span>
          <span style={{ flex: 1 }}>
            Tap to activate {prewarmTypes.join(' & ')} access for your employer
          </span>
          <button
            onClick={e => { e.stopPropagation(); setPrewarmTypes([]); prewarmCheckedRef.current = false; }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default WorkerGlobalServices;
