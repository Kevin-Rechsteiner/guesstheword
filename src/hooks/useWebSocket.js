import { useCallback, useEffect, useRef, useState } from 'react';

const useWebSocket = (url = null) => {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 3000; // 3 seconds

  const connectWebSocket = useCallback(() => {
    try {
      // Dynamische WebSocket URL für Railway
      let wsUrl;
      if (url) {
        wsUrl = url;
      } else if (window.location.protocol === 'https:') {
        // Production (Railway) - verwende wss und gleichen Host
        wsUrl = `wss://${window.location.host}`;
      } else {
        // Entwicklung - verwende ws und localhost:3001
        wsUrl = `ws://localhost:3001`;
      }

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected to:', wsUrl);
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setConnected(false);

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(1.5, reconnectAttempts.current);
          console.log(`⏳ Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          reconnectAttempts.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('⚠️ WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ WebSocket creation error:', error);
    }
  }, [url]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, message queued');
    }
  };

  return {
    ws: wsRef.current,
    connected,
    sendMessage
  };
};

export default useWebSocket;