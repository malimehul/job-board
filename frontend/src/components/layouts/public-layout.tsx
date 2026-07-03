"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import UserMenu from "@/components/ui/user-menu";
import { Briefcase, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Public Layout template shell wrapping public pages.
 * Features a glassmorphism header, responsive menus, session-aware controls, and a footer.
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileMenu = () => setIsMobileOpen(false);
  console.log(user, (!user || user.role === "Candidate"));
  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "Admin") return "/admin/dashboard";
    if (user.role === "Recruiter") return "/recruiter/dashboard";
    return "/candidate/dashboard";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-ink dark:text-zinc-50 flex flex-col justify-between">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-ink dark:text-white">
              <Briefcase className="h-6 w-6 text-primary" />
              <span>JobPortal</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
              {(!user || user.role === "Candidate") && (
                <Link href="/jobs" className="hover:text-ink dark:hover:text-zinc-50 transition-colors">
                  Find Jobs
                </Link>
              )
              }
              {(!user || user.role === "Recruiter") && (
                <Link href="/recruiter/jobs/new" className="hover:text-ink dark:hover:text-zinc-50 transition-colors">
                  Post a Job
                </Link>
              )
              }
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href={getDashboardHref()}>
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    My Dashboard
                  </Button>
                </Link>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                <UserMenu />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted hover:text-ink dark:hover:text-zinc-50 transition-colors">
                  Sign In
                </Link>
                <Link href="/register">
                  <Button size="sm" className="cursor-pointer">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && <UserMenu />}
            <button
              onClick={toggleMobileMenu}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Mobile Menu Drawer Panel */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between h-[calc(100vh-4rem)] animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4 text-base font-semibold text-ink dark:text-zinc-50">
            <Link href="/jobs" onClick={closeMobileMenu} className="hover:text-primary transition-colors">
              Find Jobs
            </Link>
            <Link href="/recruiter/jobs/new" onClick={closeMobileMenu} className="hover:text-primary transition-colors">
              Post a Job
            </Link>
          </nav>

          <div className="space-y-3 pb-8">
            {user ? (
              <Link href={getDashboardHref()} onClick={closeMobileMenu}>
                <Button className="w-full cursor-pointer">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={closeMobileMenu} className="block text-center text-sm font-medium text-muted hover:text-ink mb-4">
                  Sign In
                </Link>
                <Link href="/register" onClick={closeMobileMenu}>
                  <Button className="w-full cursor-pointer">Register Account</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Portal Viewport */}
      <main className="flex-grow">
        {children}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-ink dark:text-white mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
              <span>JobPortal</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Simplifying the recruitment landscape by pairing top talent with industry leaders worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink dark:text-zinc-200 mb-4">Product</h3>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/jobs" className="hover:text-primary">Find Jobs</Link></li>
              <li><Link href="/recruiter/jobs/new" className="hover:text-primary">Post openings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink dark:text-zinc-200 mb-4">Company</h3>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="#" className="hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink dark:text-zinc-200 mb-4">Legal</h3>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-100 dark:border-zinc-800 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-muted gap-4">
          <p>&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary">Twitter</Link>
            <Link href="#" className="hover:text-primary">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
