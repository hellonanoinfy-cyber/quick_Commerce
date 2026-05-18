import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';

import { isGuestUser } from '@/lib/utils/jwt';
import useAuthStore from '@/stores/auth-store';
import useNotificationStore from '@/stores/notification-store';

const getValue = (data, key) => data?.[key] ?? data?.[key.charAt(0).toUpperCase() + key.slice(1)];

export const useNotifications = () => {
  const { token, isAuthenticated } = useAuthStore();
  const addNotification = useNotificationStore(state => state.addNotification);
  const clearAll = useNotificationStore(state => state.clearAll);
  const connectionRef = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!isAuthenticated || !token || isGuestUser(token)) {
      clearAll();
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      return;
    }

    if (
      connectionRef.current &&
      (connectionRef.current.state === signalR.HubConnectionState.Connected ||
        connectionRef.current.state === signalR.HubConnectionState.Connecting)
    ) {
      return;
    }

    const connectWithRetry = async connection => {
      try {
        await connection.start();
        retryCount.current = 0;
      } catch (_err) {
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          const timeout = Math.pow(2, retryCount.current) * 1000;
          setTimeout(() => connectWithRetry(connection), timeout);
        }
      }
    };

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications', {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.previousRetryCount < 10) {
            return Math.pow(2, retryContext.previousRetryCount) * 1000;
          }
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.None)
      .build();

    connectionRef.current = connection;

    connection.on('OrderUpdate', data => {
      const orderId = getValue(data, 'orderId');
      const status = getValue(data, 'status');

      addNotification({
        id: `order:${orderId}:${status}`,
        title: 'Order Updated',
        message: `Order #${orderId} status changed to ${status}`,
        type: 'order',
        data,
      });
    });

    connection.on('DeliveryUpdate', data => {
      const orderId = getValue(data, 'orderId');
      const message = getValue(data, 'message') || 'Your delivery status was updated.';

      addNotification({
        id: `delivery:${orderId}:${message}`,
        title: 'Delivery Update',
        message,
        type: 'delivery',
        data,
      });
    });

    connection.on('PromotionalAlert', data => {
      const message = getValue(data, 'message') || 'A new offer is available.';

      addNotification({
        id: `promo:${message}`,
        title: 'Special Offer',
        message,
        type: 'promo',
        data,
      });
    });

    connection.on('ReceiveNotification', data => {
      addNotification({
        id: getValue(data, 'id') || getValue(data, 'notificationId'),
        title: getValue(data, 'title') || 'New Notification',
        message: getValue(data, 'message') || getValue(data, 'body') || '',
        type: getValue(data, 'type') || 'info',
        createdAt: getValue(data, 'createdAt') || getValue(data, 'timestamp'),
        isRead: getValue(data, 'isRead') ?? false,
        data,
      });
    });

    connectWithRetry(connection);

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [addNotification, clearAll, isAuthenticated, token]);

  return null;
};

export default useNotifications;
