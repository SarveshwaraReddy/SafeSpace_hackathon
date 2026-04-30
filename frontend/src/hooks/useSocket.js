import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (incidentId = null) => {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL, {
      query: { incidentId },
      transports: ['websocket'],
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [incidentId]);

  return socketRef.current;
};
