"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Menu, X, Briefcase } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import UserMenu from "@/components/ui/user-menu";
import NotificationsMenu from "@/components/ui/notifications-menu";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  role: "Candidate" | "Recruiter" | "Admin";
  navigationItems: NavigationItem[];
  children: React.ReactNode;
}

/**
 * Reusable shell containing Desktop Sidebar, Top Header,
 * Breadcrumbs, User Profile Dropdown, Bell Notifications, and Mobile Navigation Drawer.
 */
export function DashboardLayout({ role, navigationItems, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-ink dark:text-zinc-50">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-30">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-ink dark:text-white">
            <Briefcase className="h-6 w-6 text-primary" />
            <span>JobPortal</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-light/10 text-primary dark:bg-primary-light/5"
                    : "text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-ink dark:hover:text-zinc-50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-zinc-400 dark:text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-850 rounded-md border border-zinc-250/10">
            <div className="h-8 w-8 rounded-full bg-zinc-250/20 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs">
              {role[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-500 truncate uppercase tracking-wider">
                Access Level
              </p>
              <p className="text-sm font-medium text-ink dark:text-zinc-50 truncate">
                {role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation Overlay & Panel */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Side Drawer Panel */}
          <div className="relative flex flex-col w-64 bg-white dark:bg-zinc-900 h-full border-r border-zinc-200 dark:border-zinc-800 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={closeMobileMenu}>
                <Briefcase className="h-6 w-6 text-primary" />
                <span>JobPortal</span>
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-light/10 text-primary"
                        : "text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 block mb-1">
                Access Profile
              </span>
              <span className="text-sm font-medium text-ink dark:text-zinc-200">
                Logged in as {role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Outer Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <Breadcrumbs />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationsMenu key={role} />
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
            <UserMenu />
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
