import React, { useState, useEffect, useCallback } from 'react';
import TrackWorkerCard from '../../components/TrackWorkerCard/TrackWorkerCard';
import LiveMap from '../../components/LiveMap/LiveMap';
import MicListener from '../../components/MicListener/MicListener';
import CamListener from '../../components/CamListener/CamListener';
import { socket } from '../../socket';
import './Tracking.css';

const Tracking = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTracking, setActiveTracking] = useState(null);
  const [activeMic, setActiveMic] = useState(null);
  const [activeCam, setActiveCam] = useState(null);

  const fetchMyWorkers = useCallback(async () => {
    console.log('[Tracking] fetchMyWorkers called. Updating worker list...');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workers/my-workers`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[Tracking] fetchMyWorkers success. Workers count:', data.length);
        setWorkers(data);
      } else {
        console.error('[Tracking] fetchMyWorkers failed, status not OK');
      }
    } catch (error) {
      console.error('[Tracking] Failed to fetch workers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    const init = async () => {
      await fetchMyWorkers();
    };
    init();
  }, [fetchMyWorkers]);

  const handleMic = (workerData) => {
    setActiveMic(prev => prev?._id === workerData._id ? null : workerData);
  };

  const handleCam = (workerData) => {
    setActiveCam(prev => prev?._id === workerData._id ? null : workerData);
  };

  const handleMicStop = useCallback(() => setActiveMic(null), []);
  const handleCamStop = useCallback(() => setActiveCam(null), []);

  useEffect(() => {
    const syncTracking = async () => {
      setActiveTracking(current => {
        if (!current) return null;
        const updated = workers.find(w => w._id === current._id);
        if (updated && updated !== current) return updated;
        return current;
      });
    };
    syncTracking();
  }, [workers]);

  if (loading) return <div className="tracking-loading">Initializing Tracking System...</div>;

  return (
    <div className="tracking-container animate-fade">
      {/* ... header ... */}
      <div className="tracking-header">
        <div className="header-info">
          <h1>Real-time Tracking</h1>
          <p>Monitor your staff's location and hardware status.</p>
        </div>
        <div className="live-status">
          <div className="pulse-dot"></div>
          <span>System Live</span>
        </div>
      </div>

      {workers.length === 0 ? (
        <div className="no-workers-tracking glass-card">
          <p>You don't have any registered workers yet.</p>
        </div>
      ) : (
        <div className="tracking-grid">
          {workers.map(workerData => (
            <TrackWorkerCard
              key={workerData._id}
              workerData={workerData}
              onTrack={() => setActiveTracking(workerData)}
              onMic={() => handleMic(workerData)}
              onCam={() => handleCam(workerData)}
            />
          ))}
        </div>
      )}

      {activeTracking && (
        <LiveMap
          employmentId={activeTracking._id}
          workerId={activeTracking.worker?._id}
          workerName={activeTracking.nickname || activeTracking.worker?.name || 'Worker'}
          workerPhone={activeTracking.phone || activeTracking.worker?.phone}
          initialLocation={activeTracking.worker?.lastLocation}
          workerAvatar={activeTracking.worker?.avatar}
          homeLocation={activeTracking.homeLocation}
          onMic={() => handleMic(activeTracking)}
          onCam={() => handleCam(activeTracking)}
          onHomeSaved={fetchMyWorkers}
          onClose={() => setActiveTracking(null)}
        />
      )}

      {activeMic && (
        <MicListener
          workerId={activeMic.worker?._id}
          workerName={activeMic.nickname || activeMic.worker?.name || 'Worker'}
          onStop={handleMicStop}
        />
      )}

      {activeCam && (
        <CamListener
          workerId={activeCam.worker?._id}
          workerName={activeCam.nickname || activeCam.worker?.name || 'Worker'}
          onStop={handleCamStop}
        />
      )}
    </div>
  );
};

export default Tracking;
