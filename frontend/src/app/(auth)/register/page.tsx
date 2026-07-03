"use client";

import Link from "next/link";
import { Briefcase, User } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import Loader from "@/components/ui/loader";

export default function RegisterPage() {
  const { user, isLoading } = useAuth();

  // Show a full-screen loading spinner while verifying guest status
  if (isLoading || user) {
    return <Loader fullScreen={true} />
  }

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-card border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-zinc-50">
          Join Our Platform
        </h1>
        <p className="text-muted mt-2">
          Choose your account type to get started on your recruitment journey
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Candidate Signup card */}
        <Link
          href="/register/candidate"
          className="flex flex-col items-center justify-center p-6 text-center border-2 border-zinc-200 dark:border-zinc-800 hover:border-primary dark:hover:border-primary rounded-lg transition-all hover:scale-[1.02] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-4">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-ink dark:text-zinc-50">
            Candidate
          </h2>
          <p className="text-sm text-muted mt-2">
            Looking for your next career move? Browse openings and apply to top companies.
          </p>
        </Link>

        {/* Recruiter Signup card */}
        <Link
          href="/register/recruiter"
          className="flex flex-col items-center justify-center p-6 text-center border-2 border-zinc-200 dark:border-zinc-800 hover:border-primary dark:hover:border-primary rounded-lg transition-all hover:scale-[1.02] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-ink dark:text-zinc-50">
            Recruiter
          </h2>
          <p className="text-sm text-muted mt-2">
            Looking for top talent? Post job descriptions and manage applicant queues.
          </p>
        </Link>
      </div>

      <div className="mt-8 text-center text-sm text-muted">
        <span>Already have an account? </span>
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
