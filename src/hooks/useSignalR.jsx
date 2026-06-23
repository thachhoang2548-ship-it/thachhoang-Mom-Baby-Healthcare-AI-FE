import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthController } from '../controllers/authController';
import { useAlertController } from '../controllers/alertController';
import toast from 'react-hot-toast';
import React from 'react';

export function useSignalR() {
  const token = useAuthController((state) => state.token);
  const isAuthenticated = useAuthController((state) => state.isAuthenticated);
  const addAlert = useAlertController((state) => state.addAlert);
  const setSignalRConnected = useAlertController((state) => state.setSignalRConnected);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setSignalRConnected(false);
      }
      return;
    }

    const hubUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/hubs/alerts`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveAlert', (alert) => {
      console.log('SignalR ReceiveAlert:', alert);

      addAlert(alert);

      // Display a beautiful customizable hot toast
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-slide-in' : 'animate-fade-in'
            } max-w-md w-full bg-pink-50 border-l-4 border-momPink shadow-xl rounded-r-2xl pointer-events-auto flex p-4 ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1">
              <p className="text-sm font-bold text-momPink-dark flex items-center gap-1.5">
                🌸 {alert.title || alert.titleVi || 'Cảnh Báo Sức Khỏe'}
              </p>
              <p className="mt-1 text-xs text-gray-700 leading-relaxed font-medium">
                {alert.message || alert.messageVi}
              </p>
              {(alert.suggestion || alert.suggestionVi) && (
                <p className="mt-2 text-[10px] text-gray-500 font-semibold bg-white/70 p-2 rounded-xl border border-pink-100/60 leading-normal">
                  💡 AI khuyên: {alert.suggestion || alert.suggestionVi}
                </p>
              )}
            </div>
          </div>
        ),
        { duration: 6000 }
      );
    });

    connectionRef.current = connection;

    async function startConnection() {
      try {
        await connection.start();
        console.log('SignalR AlertHub connected!');
        setSignalRConnected(true);
      } catch (err) {
        console.error('SignalR AlertHub connection failed:', err);
        setSignalRConnected(false);

        // If unauthorized (401), logout to clear stale/expired tokens and stop retrying
        const errMsg = err.toString();
        if (errMsg.includes('401') || errMsg.includes('Unauthorized')) {
          console.warn('SignalR unauthorized (401), clearing stale session...');
          useAuthController.getState().logout();
          return;
        }

        // Try again in 5 seconds if still active
        setTimeout(() => {
          if (
            connectionRef.current &&
            connectionRef.current.state === signalR.HubConnectionState.Disconnected
          ) {
            startConnection();
          }
        }, 5000);
      }
    }

    startConnection();

    connection.onclose(() => {
      setSignalRConnected(false);
    });

    connection.onreconnecting(() => {
      setSignalRConnected(false);
    });

    connection.onreconnected(() => {
      setSignalRConnected(true);
      toast.success('Đã kết nối lại hệ thống giám sát sức khỏe 💚', { id: 'signalr-status' });
    });

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setSignalRConnected(false);
      }
    };
  }, [token, isAuthenticated, addAlert, setSignalRConnected]);
}
