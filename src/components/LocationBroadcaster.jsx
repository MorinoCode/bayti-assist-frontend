import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { Capacitor } from '@capacitor/core';

const getBgGeo = () => Capacitor.Plugins.BackgroundGeolocation;

const PERSIST_INTERVAL = 10_000;

const LocationBroadcaster = ({ employments }) => {
  const bgWatchId = useRef(null);
  const webWatchId = useRef(null);
  const isTrackingRef = useRef(false);
  const lastPersistRef = useRef(0);
  const latestCoordsRef = useRef(null);
  const persistTimerRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [status, setStatus] = useState('idle'); // 'idle' | 'tracking' | 'error'
  // Updated synchronously on every render — no stale closure risk.
  const trackableRef = useRef([]);
  useEffect(() => {
    trackableRef.current = (employments || []).filter(
      emp => emp.permissions?.liveTracking === 'granted'
    );
  }, [employments]);

  const persistLocation = async (lat, lng) => {
    const now = Date.now();
    if (now - lastPersistRef.current < PERSIST_INTERVAL) return;
    lastPersistRef.current = now;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo?.token) return;
      await fetch(`${import.meta.env.VITE_API_URL}/workers/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ lat, lng }),
      });
    } catch (err) {
      // Non-fatal: real-time socket stream is unaffected
      console.error('[LocationBroadcaster] DB persist failed:', err.message);
    }
  };

  const handleLocationUpdate = (latitude, longitude) => {
    latestCoordsRef.current = { lat: latitude, lng: longitude };
    console.log(`[LocationBroadcaster] position received: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} | socket: ${socket.connected ? 'connected' : 'disconnected'}`);

    const currentEmployments = trackableRef.current;
    if (currentEmployments.length === 0) return;

    // Socket.io buffers emits while reconnecting — no need to gate on socket.connected
    currentEmployments.forEach(emp => {
      socket.emit('update-location', {
        employmentId: emp._id,
        location: { lat: latitude, lng: longitude },
      });
    });
  };

  const startTracking = async () => {
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;
    setStatus('tracking');
    console.log('[LocationBroadcaster] startTracking — platform:', Capacitor.isNativePlatform() ? 'native' : 'web');

    if (!socket.connected) socket.connect();

    if (Capacitor.isNativePlatform()) {
      await startNativeTracking();
    } else {
      startWebTracking();
    }

    persistTimerRef.current = setInterval(() => {
      if (latestCoordsRef.current) {
        lastPersistRef.current = 0; // force a persist on the next call
        persistLocation(latestCoordsRef.current.lat, latestCoordsRef.current.lng);
      }
    }, PERSIST_INTERVAL);
  };

  const startNativeTracking = async () => {
    try {
      // Do NOT call Geolocation.requestPermissions() here first.
      // On iOS, doing so triggers the "When In Use" prompt and causes the OS to defer
      // the "Always" prompt (which the plugin requests below). Let the plugin own the
      // full two-step iOS permission funnel via requestPermissions: true.
      bgWatchId.current = await getBgGeo().addWatcher(
        {
          backgroundMessage: 'Your live location is being shared with your employer.',
          backgroundTitle: 'Live Tracking Active',
          requestPermissions: true,
          stale: false,
          distanceFilter: 15, // 15 m balances real-time accuracy against battery drain
        },
        (location, error) => {
          if (error) {
            if (error.code === 'NOT_AUTHORIZED') {
              // Dispatch to the UI layer so a non-blocking modal can prompt the user.
              // Never use window.confirm inside a native background callback.
              window.dispatchEvent(new CustomEvent('location-permission-denied'));
            } else {
              console.error('[LocationBroadcaster] Native watcher error:', error.code, error.message);
            }
            return;
          }
          if (location) {
            handleLocationUpdate(location.latitude, location.longitude);
          }
        }
      );
    } catch (err) {
      console.error('[LocationBroadcaster] Failed to start native watcher:', err);
      isTrackingRef.current = false;
    }
  };

  const startWebTracking = () => {
    if (!navigator.geolocation) {
      console.error('[LocationBroadcaster] Geolocation API not available in this browser');
      setStatus('error');
      return;
    }

    console.log('[LocationBroadcaster] watchPosition started — waiting for browser permission...');

    webWatchId.current = navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        handleLocationUpdate(latitude, longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          console.error('[LocationBroadcaster] Browser location permission DENIED by user');
          setStatus('error');
          window.dispatchEvent(new CustomEvent('location-permission-denied'));
        } else {
          console.error('[LocationBroadcaster] Web geolocation error:', error.code, error.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0, // never return a cached position for a real-time tracker
      }
    );
  };

  const stopTracking = () => {
    if (!isTrackingRef.current) return;
    isTrackingRef.current = false;
    setStatus('idle');

    if (persistTimerRef.current) {
      clearInterval(persistTimerRef.current);
      persistTimerRef.current = null;
    }

    if (Capacitor.isNativePlatform()) {
      if (bgWatchId.current !== null) {
        getBgGeo().removeWatcher({ id: bgWatchId.current });
        bgWatchId.current = null;
      }
    } else {
      if (webWatchId.current !== null) {
        navigator.geolocation.clearWatch(webWatchId.current);
        webWatchId.current = null;
      }
    }

    latestCoordsRef.current = null;
  };

  useEffect(() => {
    const count = trackableRef.current.length;
    console.log(`[LocationBroadcaster] employments updated — ${count} trackable employer(s)`);
    if (count > 0) {
      startTracking();
    } else {
      stopTracking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employments]);

  useEffect(() => {
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default LocationBroadcaster;
