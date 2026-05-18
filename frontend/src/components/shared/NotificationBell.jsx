'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useState } from 'react';

import useNotificationStore from '@/stores/notification-store';

// NEW
export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotificationStore();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 text-[var(--brand-primary)] hover:bg-[#FDF2F7] rounded-full transition-colors"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div className="fixed inset-0 z-[1000]" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed left-3 right-3 top-[84px] z-[1001] overflow-hidden rounded-xl border border-[#F0E0E8] bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
            >
              <div className="p-4 border-b border-[#F0E0E8] flex justify-between items-center bg-[#FDF2F7]">
                <h3 className="font-bold text-[#1A1A1A]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[var(--brand-primary)] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#6B6B6B]">
                    <Bell size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`
                        p-4 border-b border-[#F5F5F5] cursor-pointer transition-colors
                        ${!notification.isRead ? 'bg-[#FDF2F7]/30' : 'hover:bg-[#F9F9F9]'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-[#1A1A1A]">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)] mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-[#6B6B6B] leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-[#9E9E9E]">
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 text-center border-t border-[#F0E0E8] bg-[#F9F9F9]">
                  <button className="text-xs text-[#6B6B6B] hover:text-[var(--brand-primary)] transition-colors">
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
