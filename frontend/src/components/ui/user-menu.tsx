"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";

/**
 * Premium Dropdown Menu displaying user details, avatar initials,
 * role-specific dashboard link, and a sign-out trigger.
 */
export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  // Extract initials for the circular fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getDashboardHref = () => {
    if (user.role === "Admin") return "/admin/dashboard";
    if (user.role === "Recruiter") return "/recruiter/dashboard";
    return "/candidate/dashboard";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-hidden group"
        aria-label="User menu"
      >
        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer">
          {getInitials(user.name)}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-50 animate-in fade-in-50 slide-in-from-top-1 duration-100">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm font-semibold text-ink dark:text-zinc-50 truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted truncate mt-0.5">
              {user.email}
            </p>
            <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mt-2 border border-zinc-200 dark:border-zinc-700">
              {user.role}
            </span>
          </div>

          <div className="py-1">
            <Link
              href={getDashboardHref()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-zinc-400" />
              Dashboard
            </Link>

            {user.role === "Candidate" && (
              <Link
                href="/candidate/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Settings className="h-4 w-4 text-zinc-400" />
                Edit Profile
              </Link>
            )}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 py-1">
            <button
              onClick={async () => {
                setIsOpen(false);
                await logout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
