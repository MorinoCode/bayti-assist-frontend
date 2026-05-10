import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  // Pass the JWT on every (re)connection — the server middleware verifies it
  auth: (cb) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    cb({ token: userInfo.token || '' });
  },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1_000,
  reconnectionDelayMax: 15_000,
  timeout: 20_000,
});
