'use client';

import useNotifications from '@/hooks/use-notifications';

// NEW
export default function NotificationInitializer() {
  useNotifications();
  return null;
}
