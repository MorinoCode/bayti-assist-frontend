import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import LocationBroadcaster from './LocationBroadcaster';
import { useMicBroadcaster } from '../hooks/useMicBroadcaster';
import { useCamBroadcaster } from '../hooks/useCamBroadcaster';
import { socket } from '../socket';
import toast from 'react-hot-toast';

const WorkerGlobalServices = () => {
  const { user } = useAuth();
  const [employments, setEmployments] = useState([]);
  const isWorker = user?.role === 'worker';

  const { isMicActive } = useMicBroadcaster(isWorker);
  const { isCamActive } = useCamBroadcaster(isWorker);

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
      }
    } catch (err) {
      console.error('[WorkerGlobalServices] Failed to fetch employments:', err);
    }
  }, []);

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

  if (!isWorker) return null;

  return <LocationBroadcaster employments={employments} />;
};

export default WorkerGlobalServices;
