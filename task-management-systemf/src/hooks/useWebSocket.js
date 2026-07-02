import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketStore } from '../store/websocket.store';

export const useWebSocket = (boardId, teamId) => {
  const client = useRef(null);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const setStatus = useWebSocketStore((state) => state.setStatus);

  useEffect(() => {
    if (!token || (!boardId && !teamId)) return;

    client.current = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? '/ws' : 'http://localhost:8080/ws')),
      // STOMP headers can't always pass auth easily with SockJS in some setups,
      // but we try passing it in connectHeaders. If backend doesn't read it,
      // you might need to send it as a connect frame header or token query param.
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      // Initial reconnect delay (1 second)
      reconnectDelay: 1000,
      debug: function (str) {
        console.debug(str);
      },
      onConnect: () => {
        setStatus('online');
        client.current.reconnectDelay = 1000; // Reset to 1s on successful connection
        
        if (boardId) {
          client.current.subscribe(`/topic/board/${boardId}`, (message) => {
            queryClient.invalidateQueries({ queryKey: ['board', Number(boardId)] });
          });
        }
        
        if (teamId) {
          client.current.subscribe(`/topic/team/${teamId}`, (message) => {
            queryClient.invalidateQueries({ queryKey: ['boards', Number(teamId)] });
          });
        }
      },
      onWebSocketClose: () => {
        setStatus('offline');
        // Exponential backoff: double the delay up to a max of 16 seconds
        const nextDelay = Math.min(client.current.reconnectDelay * 2, 16000);
        client.current.reconnectDelay = nextDelay;
      },
      onDisconnect: () => {
        setStatus('offline');
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setStatus('reconnecting');
      },
    });

    client.current.activate();

    return () => {
      if (client.current) {
        client.current.deactivate();
      }
    };
  }, [boardId, teamId, token, queryClient]);

  const status = useWebSocketStore((state) => state.status);
  return { isConnected: status === 'online', status };
};
