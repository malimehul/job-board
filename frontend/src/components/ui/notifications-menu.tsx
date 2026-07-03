"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Bell, Check, Info } from "lucide-react";

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Record<string, NotificationItem[]> = {
  Candidate: [
    { id: "c1", message: "Application status updated: Shortlisted for React Developer at TechCorp.", time: "2 hours ago", read: false },
    { id: "c2", message: "New job alert: 5 new Remote Frontend positions match your skills.", time: "1 day ago", read: false },
    { id: "c3", message: "Resume parsed successfully. Your profile is now visible to recruiters.", time: "2 days ago", read: true },
  ],
  Recruiter: [
    { id: "r1", message: "New application received: John Doe applied for Senior Node Engineer.", time: "1 hour ago", read: false },
    { id: "r2", message: "Billing update: Your invoice for Job Posting Plan is ready.", time: "5 hours ago", read: false },
    { id: "r3", message: "Job listing 'QA Specialist' matches 12 new candidate profiles.", time: "3 days ago", read: true },
  ],
  Admin: [
    { id: "a1", message: "Security warning: High volume of signup attempts detected from IP 192.168.1.1.", time: "15 minutes ago", read: false },
    { id: "a2", message: "Database replication completed successfully.", time: "4 hours ago", read: false },
    { id: "a3", message: "System report 'User Signups (June)' is compiled.", time: "1 day ago", read: true },
  ],
};

/**
 * Interactive Notification Menu showing role-specific alerts
 * with mark-as-read capability.
 */
export function NotificationsMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<NotificationItem[]>(() => {
    return mockNotifications[user?.role || "Candidate"] || [];
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = items.filter((item) => !item.read).length;

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleMarkSingleRead = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted hover:text-ink dark:hover:text-zinc-50 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-hidden cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-50 animate-in fade-in-50 slide-in-from-top-1 duration-100">
          <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span className="text-sm font-semibold text-ink dark:text-zinc-50">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted">
                No notifications to display
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkSingleRead(item.id)}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                    !item.read ? "bg-zinc-50/50 dark:bg-zinc-800/10" : ""
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${
                    !item.read ? "bg-zinc-100 dark:bg-zinc-800 text-primary" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}>
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-zinc-700 dark:text-zinc-300 leading-normal ${
                      !item.read ? "font-semibold" : ""
                    }`}>
                      {item.message}
                    </p>
                    <span className="text-[10px] text-muted block mt-1">
                      {item.time}
                    </span>
                  </div>
                  {!item.read && (
                    <div className="h-2 w-2 bg-primary rounded-full shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsMenu;
