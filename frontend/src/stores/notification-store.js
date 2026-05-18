import { create } from 'zustand';

const MAX_NOTIFICATIONS = 50;

const getNotificationId = notification => {
  if (notification.id) return String(notification.id);
  if (notification.Id) return String(notification.Id);
  if (notification.notificationId) return String(notification.notificationId);
  if (notification.NotificationId) return String(notification.NotificationId);

  const data =
    notification.data || notification.Data || notification.metadata || notification.Metadata || {};
  const referenceId =
    notification.referenceId ||
    notification.ReferenceId ||
    notification.orderId ||
    notification.OrderId ||
    data.referenceId ||
    data.ReferenceId ||
    data.orderId ||
    data.OrderId ||
    '';

  return [
    notification.type || notification.Type || 'notification',
    referenceId,
    notification.title || notification.Title || '',
    notification.message || notification.Message || notification.body || notification.Body || '',
  ].join(':');
};

const normalizeNotification = notification => ({
  id: getNotificationId(notification),
  title: notification.title || notification.Title || 'Notification',
  message:
    notification.message || notification.Message || notification.body || notification.Body || '',
  type: notification.type || notification.Type || 'info',
  data:
    notification.data ||
    notification.Data ||
    notification.metadata ||
    notification.Metadata ||
    null,
  isRead: Boolean(notification.isRead ?? notification.IsRead ?? false),
  createdAt:
    notification.createdAt ||
    notification.CreatedAt ||
    notification.timestamp ||
    notification.Timestamp ||
    new Date().toISOString(),
});

const withUnreadCount = notifications => ({
  notifications,
  unreadCount: notifications.filter(notification => !notification.isRead).length,
});

const useNotificationStore = create(set => ({
  notifications: [],
  unreadCount: 0,

  addNotification: notification => {
    const nextNotification = normalizeNotification(notification);

    set(state => {
      const existingIndex = state.notifications.findIndex(item => item.id === nextNotification.id);
      const notifications =
        existingIndex >= 0
          ? state.notifications.map(item =>
              item.id === nextNotification.id ? { ...item, ...nextNotification } : item
            )
          : [nextNotification, ...state.notifications];

      return withUnreadCount(notifications.slice(0, MAX_NOTIFICATIONS));
    });
  },

  setNotifications: notifications => {
    const seen = new Set();
    const normalized = notifications
      .map(normalizeNotification)
      .filter(notification => {
        if (seen.has(notification.id)) return false;
        seen.add(notification.id);
        return true;
      })
      .slice(0, MAX_NOTIFICATIONS);

    set(withUnreadCount(normalized));
  },

  markAsRead: notificationId => {
    set(state => {
      const notifications = state.notifications.map(notification =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      );

      return withUnreadCount(notifications);
    });
  },

  markAllRead: () => {
    set(state => {
      const notifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true,
      }));

      return withUnreadCount(notifications);
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

export default useNotificationStore;
