import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  ...(import.meta.env.VITE_TURN_URL ? [{
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  }] : []),
];

export const useMicBroadcaster = (enabled = true) => {
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const pendingCandidates = useRef([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const stop = () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      pcRef.current?.close();
      pcRef.current = null;
      pendingCandidates.current = [];
      setIsActive(false);
    };

    const onMicRequest = async ({ fromSocketId }) => {
      stop();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            socket.emit('mic-ice-candidate', { toSocketId: fromSocketId, candidate });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('mic-offer', { toSocketId: fromSocketId, offer });
        setIsActive(true);
      } catch (err) {
        console.error('[MicBroadcaster] getUserMedia failed:', err.name, err.message);
        setIsActive(false);
      }
    };

    const onMicAnswer = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      for (const c of pendingCandidates.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      }
      pendingCandidates.current = [];
    };

    const onIceCandidate = async ({ candidate }) => {
      const pc = pcRef.current;
      if (!pc) return;
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    socket.on('mic-request', onMicRequest);
    socket.on('mic-answer', onMicAnswer);
    socket.on('mic-ice-candidate', onIceCandidate);
    socket.on('mic-stop', stop);

    return () => {
      socket.off('mic-request', onMicRequest);
      socket.off('mic-answer', onMicAnswer);
      socket.off('mic-ice-candidate', onIceCandidate);
      socket.off('mic-stop', stop);
      stop();
    };
  }, [enabled]);

  return { isMicActive: isActive };
};
