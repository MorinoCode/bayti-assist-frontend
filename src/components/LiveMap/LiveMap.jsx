import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { socket } from '../../socket';
import { getAvatarPath } from '../../utils/avatarMapper';
import toast from 'react-hot-toast';
import { Settings, Bell, BellOff } from 'lucide-react';
import './LiveMap.css';

import whatsappIcon from '../../assets/whatsapplogo.png';
import micIcon from '../../assets/homepage/trackmicrophone.png';
import camIcon from '../../assets/homepage/trackcamera.png';
import homeIconImg from '../../assets/trackingpage/home.png';

if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const MapAutoInvalidate = () => {
  const map = useMap();
  useEffect(() => {
    const timers = [
      setTimeout(() => map.invalidateSize(), 0),
      setTimeout(() => map.invalidateSize(), 100),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 600),
    ];

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => map.invalidateSize());
    const container = map.getContainer();
    if (container) observer.observe(container);
    if (container?.parentElement) observer.observe(container.parentElement);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [map]);
  return null;
};

const MapPanner = ({ lat, lng }) => {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const prev = prevRef.current;
    if (prev && prev.lat === lat && prev.lng === lng) return;
    prevRef.current = { lat, lng };

    try {
      const center = map.getCenter();
      const dist = L.latLng(lat, lng).distanceTo(center);
      if (dist > 10) {
        map.flyTo([lat, lng], map.getZoom() || 16, { duration: 1.2 });
      }
    } catch {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
};

const MapClickHandler = ({ onMapClick, active }) => {
  useMapEvents({
    click(e) {
      if (active) onMapClick(e.latlng);
    },
  });
  return null;
};

const LiveMap = ({
  employmentId,
  workerId,
  workerName,
  workerPhone,
  initialLocation,
  onClose,
  workerAvatar,
  homeLocation: savedHome,
  onMic,
  onCam,
  onHomeSaved
}) => {
  const [location, setLocation] = useState(initialLocation || null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(initialLocation?.timestamp ? new Date(initialLocation.timestamp) : null);
  const [currentHome, setCurrentHome] = useState(savedHome || null);
  const [homeRadius, setHomeRadius] = useState(savedHome?.radius || 200);
  const [notifyOnLeave, setNotifyOnLeave] = useState(savedHome?.notifyOnLeave || false);
  const [isSettingHome, setIsSettingHome] = useState(false);
  const [isSettingRadius, setIsSettingRadius] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasNotifiedLeft, setHasNotifiedLeft] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapContentRef = useRef(null);

  useEffect(() => {
    const el = mapContentRef.current;
    if (!el) return;
    const check = () => {
      if (el.offsetHeight > 0 && el.offsetWidth > 0) {
        setMapReady(true);
      }
    };
    check();
    if (!mapReady) {
      const interval = setInterval(check, 50);
      const timeout = setTimeout(() => { setMapReady(true); clearInterval(interval); }, 500);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [mapReady]);

  const handleWhatsApp = () => {
    if (workerPhone) {
      const cleanPhone = workerPhone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const isValidLocation = location && typeof location.lat === 'number' && typeof location.lng === 'number' && Number.isFinite(location.lat) && Number.isFinite(location.lng);
  const isValidHome = currentHome && typeof currentHome.lat === 'number' && typeof currentHome.lng === 'number' && Number.isFinite(currentHome.lat) && Number.isFinite(currentHome.lng);

  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      setLocation(prev => {
        if (prev?.lat === initialLocation.lat && prev?.lng === initialLocation.lng) return prev;
        return initialLocation;
      });
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!notifyOnLeave) return;
    if (isValidLocation && isValidHome && !isSettingHome && !isSettingRadius) {
      try {
        const distance = L.latLng(location.lat, location.lng).distanceTo(L.latLng(currentHome.lat, currentHome.lng));
        if (distance > homeRadius) {
          if (!hasNotifiedLeft) {
            toast.error(`${workerName} has LEFT the home area!`, {
              duration: 5000,
              icon: '⚠️',
              style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' }
            });
            setHasNotifiedLeft(true);
          }
        } else {
          setHasNotifiedLeft(false);
        }
      } catch (e) {
        console.error("Distance calculation error:", e);
      }
    }
  }, [notifyOnLeave, isValidLocation, isValidHome, location, currentHome, homeRadius, workerName, hasNotifiedLeft, isSettingHome, isSettingRadius]);

  const fetchLastLocation = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workers/location/${workerId}`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastLocation && typeof data.lastLocation.lat === 'number' && typeof data.lastLocation.lng === 'number') {
          setLocation({ lat: data.lastLocation.lat, lng: data.lastLocation.lng });
          if (data.lastLocation.timestamp) {
            setLastUpdated(new Date(data.lastLocation.timestamp));
          }
        }
      }
    } catch (err) {
      console.error('Poll location error:', err);
    }
  }, [workerId]);

  useEffect(() => {
    fetchLastLocation();
    const joinRoom = () => socket.emit('join-tracking', employmentId);

    const onLocationUpdated = (newLoc) => {
      if (newLoc && typeof newLoc.lat === 'number' && typeof newLoc.lng === 'number') {
        setLocation(newLoc);
        setIsLive(true);
        setLastUpdated(new Date());
      }
    };

    socket.on('connect', joinRoom);
    socket.on('location-updated', onLocationUpdated);
    if (socket.connected) joinRoom();

    const pollInterval = setInterval(fetchLastLocation, 10000);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('location-updated', onLocationUpdated);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [employmentId, fetchLastLocation]);

  useEffect(() => {
    if (savedHome && typeof savedHome.lat === 'number' && typeof savedHome.lng === 'number') {
      setCurrentHome(savedHome);
      setHomeRadius(savedHome.radius || 200);
      setNotifyOnLeave(savedHome.notifyOnLeave || false);
    } else {
      setCurrentHome(null);
    }
  }, [savedHome]);

  const saveHomeConfig = async () => {
    if (!currentHome || typeof currentHome.lat !== 'number' || typeof currentHome.lng !== 'number') {
      toast.error('Please click on the map to set a location');
      return;
    }
    setIsSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workers/employment/${employmentId}/home`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          lat: currentHome.lat,
          lng: currentHome.lng,
          radius: homeRadius,
          notifyOnLeave
        })
      });

      if (res.ok) {
        await res.json();
        toast.success('Home area settings saved');
        setIsSettingHome(false);
        setIsSettingRadius(false);
        if (onHomeSaved) onHomeSaved();
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('[LiveMap] saveHomeConfig error:', error);
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const avatarImg = getAvatarPath(workerAvatar, '', 'worker', workerName);

  const workerPictureIcon = useMemo(() => {
    if (!avatarImg) return new L.Icon.Default();
    return L.divIcon({
      className: 'custom-picture-marker',
      html: `
        <div class="marker-picture-wrapper">
          <img src="${avatarImg}" alt="${workerName}" onerror="this.style.display='none'" />
          <div class="marker-pulse"></div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50]
    });
  }, [avatarImg, workerName]);

  const homeIcon = useMemo(() => L.icon({
    iconUrl: homeIconImg,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }), []);

  const handleMapClick = (latlng) => {
    if (isSettingHome) {
      setCurrentHome({ lat: latlng.lat, lng: latlng.lng });
    }
  };

  const onHomeMarkerDragEnd = (e) => {
    const marker = e.target;
    if (marker != null) {
      const { lat, lng } = marker.getLatLng();
      setCurrentHome({ lat, lng });
    }
  };

  const mapCenter = useMemo(() => {
    if (initialLocation && Number.isFinite(initialLocation.lat) && Number.isFinite(initialLocation.lng)) {
      return [initialLocation.lat, initialLocation.lng];
    }
    if (savedHome && Number.isFinite(savedHome.lat) && Number.isFinite(savedHome.lng)) {
      return [savedHome.lat, savedHome.lng];
    }
    return [29.3759, 47.9774];
  }, [initialLocation, savedHome]);

  const panTarget = useMemo(() => {
    if (isSettingHome || isSettingRadius) return null;
    if (isValidLocation) return { lat: location.lat, lng: location.lng };
    if (isValidHome) return { lat: currentHome.lat, lng: currentHome.lng };
    return null;
  }, [isSettingHome, isSettingRadius, isValidLocation, isValidHome, location, currentHome]);

  const distanceFromHome = useMemo(() => {
    if (!isValidLocation || !isValidHome) return null;
    try {
      return Math.round(L.latLng(location.lat, location.lng).distanceTo(L.latLng(currentHome.lat, currentHome.lng)));
    } catch {
      return null;
    }
  }, [isValidLocation, isValidHome, location, currentHome]);

  return createPortal(
    <div className="live-map-overlay animate-fade">
      <div className="live-map-container glass-card">
        <div className="map-header">
          <div className="worker-status-info">
            <div className={`pulse-dot ${isLive ? 'live' : 'stale'}`}></div>
            <div>
              <h3>{workerName}</h3>
              <span className="tracking-mode">{isLive ? 'Live Tracking' : 'Last Position'}</span>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-action-btn" onClick={handleWhatsApp} title="WhatsApp">
              <img src={whatsappIcon} alt="Chat" />
            </button>
            <button className="header-action-btn" onClick={onMic} title="Listen Mic">
              <img src={micIcon} alt="Mic" />
            </button>
            <button className="header-action-btn" onClick={onCam} title="View Camera">
              <img src={camIcon} alt="Cam" />
            </button>
          </div>

          <button className="close-map-circle" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="map-content" ref={mapContentRef}>
          {(isSettingHome || isSettingRadius) && (
            <div className="map-instruction animate-slide-down">
              <img src={homeIconImg} alt="home" />
              <p>
                {isSettingHome ? 'Set Home location by clicking map or dragging icon.' : `Adjust safe area radius: ${homeRadius}m`}
              </p>
            </div>
          )}

          {isValidLocation && isValidHome && !isSettingHome && !isSettingRadius && (
            <div className="map-distance-badge">
              <span className={`distance-value ${distanceFromHome !== null && distanceFromHome > homeRadius ? 'outside' : 'inside'}`}>
                {distanceFromHome !== null ? `${distanceFromHome}m from home` : 'Calculating...'}
              </span>
              {distanceFromHome !== null && distanceFromHome > homeRadius && (
                <span className="distance-warning">⚠️ Outside area</span>
              )}
            </div>
          )}

          {mapReady ? (
            <MapContainer
              center={mapCenter}
              zoom={16}
              zoomControl={false}
              attributionControl={true}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              <MapAutoInvalidate />
              {panTarget && <MapPanner lat={panTarget.lat} lng={panTarget.lng} />}
              <MapClickHandler onMapClick={handleMapClick} active={isSettingHome} />

              {isValidHome && (
                <Marker
                  position={[currentHome.lat, currentHome.lng]}
                  icon={homeIcon}
                  draggable={isSettingHome}
                  eventHandlers={{ dragend: onHomeMarkerDragEnd }}
                >
                  <Popup>
                    <div className="home-popup">
                      <strong>Home Location</strong>
                      <div className="popup-actions">
                        <button className="edit-home-btn" onClick={() => { setIsSettingHome(true); setIsSettingRadius(false); }}>Move Home</button>
                        <button className="edit-radius-btn" onClick={() => { setIsSettingRadius(true); setIsSettingHome(false); }}>Edit Area</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {isValidHome && (
                <Circle
                  center={[currentHome.lat, currentHome.lng]}
                  radius={homeRadius}
                  pathOptions={{
                    color: isSettingRadius ? '#10b981' : '#6366f1',
                    fillColor: isSettingRadius ? '#10b981' : '#6366f1',
                    fillOpacity: 0.1,
                    dashArray: '10, 10'
                  }}
                />
              )}

              {isValidLocation && (
                <Marker
                  position={[location.lat, location.lng]}
                  icon={workerPictureIcon}
                >
                  <Popup className="custom-popup">
                    <div className="popup-content">
                      <strong>{workerName}</strong>
                      <span>📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                      <span>Distance from Home: {distanceFromHome !== null ? `${distanceFromHome}m` : 'N/A'}</span>
                      {lastUpdated && <span>Updated: {lastUpdated.toLocaleTimeString()}</span>}
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          ) : (
            <div className="map-loading-placeholder">Loading map...</div>
          )}
        </div>

        <div className="map-footer">
          <div className="footer-status-pill">
            <span className="label">Signal:</span>
            <span className={`value ${isLive ? 'text-green' : 'text-orange'}`}>
              {isLive ? 'LIVE' : 'POLLING'}
            </span>
          </div>

          <div className="footer-center-actions">
            {isSettingHome || isSettingRadius ? (
              <div className="setting-home-actions">
                {isSettingRadius && (
                  <>
                    <div className="radius-slider-container">
                      <span>Radius: {homeRadius}m</span>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={homeRadius}
                        onChange={(e) => setHomeRadius(Number(e.target.value))}
                      />
                    </div>
                    <button
                      className={`notify-toggle-btn ${notifyOnLeave ? 'active' : ''}`}
                      onClick={() => setNotifyOnLeave(prev => !prev)}
                      title={notifyOnLeave ? 'Notifications enabled' : 'Notifications disabled'}
                    >
                      {notifyOnLeave ? <Bell size={16} /> : <BellOff size={16} />}
                      <span>{notifyOnLeave ? 'Alert ON' : 'Alert OFF'}</span>
                    </button>
                  </>
                )}
                <button className="cancel-home-btn" onClick={() => {
                  setIsSettingHome(false);
                  setIsSettingRadius(false);
                  setCurrentHome(savedHome);
                  setHomeRadius(savedHome?.radius || 200);
                  setNotifyOnLeave(savedHome?.notifyOnLeave || false);
                }}>Cancel</button>
                <button className="save-home-btn" onClick={saveHomeConfig} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Area'}
                </button>
              </div>
            ) : (
              <div className="home-action-group">
                <button className="set-home-trigger-btn" onClick={() => { setIsSettingHome(true); setIsSettingRadius(false); }}>
                  <img src={homeIconImg} alt="home" />
                  <span>{currentHome ? 'Change Home' : 'Set Home'}</span>
                </button>
                {currentHome && (
                  <button className="set-radius-trigger-btn" onClick={() => { setIsSettingRadius(true); setIsSettingHome(false); }}>
                    <Settings size={18} />
                    <span>Area Size</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="footer-right">
            <span className="last-update">Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LiveMap;
