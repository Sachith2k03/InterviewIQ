"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Bell, CheckCheck, FileText, Trash2 } from "lucide-react";

import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/api/notifications";

function formatNotificationTime(value: string): string {
  const date = new Date(value);

  const difference = Date.now() - date.getTime();

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationDropdown() {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();

      setUnreadCount(count);
    } catch {
      // Don't break the topbar if the
      // notification count request fails.
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);

      setError(null);

      const result = await getNotifications();

      setNotifications(result.data);

      setUnreadCount(result.unread_count);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      void loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read.",
      );
    }
  }

  async function handleDelete(notificationId: string) {
    try {
      const notification = notifications.find(
        (item) => item.id === notificationId,
      );

      await deleteNotification(notificationId);

      setNotifications((current) =>
        current.filter((item) => item.id !== notificationId),
      );

      if (notification && !notification.is_read) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete notification.",
      );
    }
  }

  async function handleNotificationClick(notification: NotificationItem) {
    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item,
          ),
        );

        setUnreadCount((current) => Math.max(0, current - 1));
      }

      setIsOpen(false);

      if (notification.related_interview_id) {
        if (notification.type === "report_ready") {
          router.push(`/reports/${notification.related_interview_id}`);

          return;
        }

        router.push(`/interviews/${notification.related_interview_id}`);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to open notification.",
      );
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="View notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        <Bell className="h-[18px] w-[18px]" />

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[#050d1d]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-white/10 bg-[#101a2e] shadow-2xl shadow-black/40 sm:w-96">
          {/* Header */}

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread`}
              </p>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-400 transition hover:text-blue-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>

          {/* Content */}

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-1 p-2">
                {Array.from({
                  length: 4,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-lg bg-white/5"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="p-5 text-center">
                <p className="text-sm text-red-300">{error}</p>

                <button
                  type="button"
                  onClick={() => void loadNotifications()}
                  className="mt-3 text-xs font-medium text-blue-400 hover:text-blue-300"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-500">
                  <Bell className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-300">
                  No notifications yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Updates about your interviews and reports will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={
                      notification.is_read
                        ? "group relative bg-transparent"
                        : "group relative bg-blue-500/[0.06]"
                    }
                  >
                    <button
                      type="button"
                      onClick={() => void handleNotificationClick(notification)}
                      className="flex w-full gap-3 px-4 py-3.5 pr-12 text-left transition hover:bg-white/[0.04]"
                    >
                      <div
                        className={
                          notification.type === "report_ready"
                            ? "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"
                            : "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"
                        }
                      >
                        {notification.type === "report_ready" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>

                          {!notification.is_read ? (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          ) : null}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                          {notification.message}
                        </p>

                        <p className="mt-1.5 text-[11px] text-slate-600">
                          {formatNotificationTime(notification.created_at)}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      aria-label="Delete notification"
                      onClick={(event) => {
                        event.stopPropagation();

                        void handleDelete(notification.id);
                      }}
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
