const warmMedia = async (constraints) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach(t => t.stop());
    return 'granted';
  } catch (err) {
    return err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
      ? 'denied'
      : 'unavailable';
  }
};

export const warmCamera = () =>
  warmMedia({ video: { facingMode: 'environment' }, audio: true });

export const warmMic = () =>
  warmMedia({ audio: true, video: false });

export const warmLocation = () =>
  new Promise(resolve => {
    if (!navigator.geolocation) return resolve('unavailable');
    navigator.geolocation.getCurrentPosition(
      () => resolve('granted'),
      err => resolve(err.code === 1 ? 'denied' : 'unavailable'),
      { timeout: 8000, maximumAge: 60_000, enableHighAccuracy: false }
    );
  });

// Returns 'granted' | 'denied' | 'prompt'
// Note: Safari does not support querying 'camera'/'microphone' — returns 'prompt' as safe fallback.
export const queryPermission = async (name) => {
  try {
    if (!navigator.permissions) return 'prompt';
    const { state } = await navigator.permissions.query({ name });
    return state;
  } catch {
    return 'prompt';
  }
};
