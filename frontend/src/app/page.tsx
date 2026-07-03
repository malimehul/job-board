"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PublicLayout from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { Job, PaginatedResponse } from "@/types";
import JobCard from "@/features/jobs/components/job-card";
import { Search, MapPin, Briefcase, Sparkles, Building2, TrendingUp, Users, ArrowRight } from "lucide-react";
import { GLOBAL_TEXT } from "@/constants/ui-text.constants";

/**
 * Root landing page redesigned as a premium, traditional job portal.
 * Features hero search controls, recent jobs, and action cards.
 */
export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");

  // Fetch recent open jobs
  const { data: jobsResponse, isLoading, error } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Job>>(
        `${API_ENDPOINTS.JOBS.BASE}?limit=4&status=open`
      );
      return response;
    },
  });

  const featuredJobs = jobsResponse?.data || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    if (skills.trim()) params.set("skills", skills.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <PublicLayout>
      <div className="space-y-16 pb-20">
        {/* 1. Hero Search Banner Section */}
        <section className="relative overflow-hidden bg-radial from-primary/10 via-transparent to-transparent py-20 sm:py-24 border-b border-zinc-150/40 dark:border-zinc-800/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-wide uppercase border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{GLOBAL_TEXT.landing.badge}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink dark:text-zinc-50 max-w-4xl mx-auto leading-tight sm:leading-none">
              Find Your Next <span className="text-primary">Dream Job</span> Today
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
              {GLOBAL_TEXT.landing.subheading}
            </p>

            {/* Search Widget Card */}
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 rounded-xl shadow-lg dark:shadow-zinc-950/50 flex flex-col md:flex-row gap-3"
            >
              {/* Keyword */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={GLOBAL_TEXT.landing.searchPlaceholderKeyword}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 border border-zinc-250 dark:border-zinc-800 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
                />
              </div>

              {/* Location */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={GLOBAL_TEXT.landing.searchPlaceholderLocation}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 border border-zinc-250 dark:border-zinc-800 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
                />
              </div>

              {/* Skills */}
              <div className="flex-1 relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={GLOBAL_TEXT.landing.searchPlaceholderSkills}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 border border-zinc-250 dark:border-zinc-800 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
                />
              </div>

              <Button type="submit" className="cursor-pointer h-11 px-8 font-semibold shrink-0">
                {GLOBAL_TEXT.landing.searchBtn}
              </Button>
            </form>
          </div>
        </section>

        {/* 2. Quick Metrics Row */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-lg shadow-xxs">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black text-ink dark:text-zinc-50">{GLOBAL_TEXT.landing.metrics.vacanciesCount}</h3>
              <p className="text-xs text-muted mt-1 font-semibold">{GLOBAL_TEXT.landing.metrics.vacanciesLabel}</p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-lg shadow-xxs">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black text-ink dark:text-zinc-50">{GLOBAL_TEXT.landing.metrics.employersCount}</h3>
              <p className="text-xs text-muted mt-1 font-semibold">{GLOBAL_TEXT.landing.metrics.employersLabel}</p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-lg shadow-xxs">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black text-ink dark:text-zinc-50">{GLOBAL_TEXT.landing.metrics.candidatesCount}</h3>
              <p className="text-xs text-muted mt-1 font-semibold">{GLOBAL_TEXT.landing.metrics.candidatesLabel}</p>
            </div>
          </div>
        </section>

        {/* 3. Featured / Recent Jobs Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-zinc-55 tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {GLOBAL_TEXT.landing.featuredTitle}
              </h2>
              <p className="text-xs text-muted mt-1">
                {GLOBAL_TEXT.landing.featuredSub}
              </p>
            </div>
            <Link href="/jobs" className="mt-4 sm:mt-0 text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              <span>{GLOBAL_TEXT.landing.viewAllJobs}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {error ? (
            <div className="p-4 bg-error-light border border-error text-error text-sm rounded-md text-center">
              {GLOBAL_TEXT.errors.failedToLoadJobs}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 rounded-lg" />
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <p className="text-sm text-muted">{GLOBAL_TEXT.errors.noFeaturedJobs}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </section>

        {/* 4. Dual Call to Action (CTA) Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Seeker Card */}
          <div className="bg-zinc-900 text-white rounded-xl p-8 border border-zinc-800 relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-3xl -mr-8 -mt-8" />
            <div className="space-y-4 relative z-10">
              <span className="text-xxs font-bold text-primary uppercase tracking-widest">{GLOBAL_TEXT.landing.ctaCandidate.badge}</span>
              <h3 className="text-xl font-bold tracking-tight">{GLOBAL_TEXT.landing.ctaCandidate.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                {GLOBAL_TEXT.landing.ctaCandidate.desc}
              </p>
            </div>
            <Link href="/register/candidate" className="mt-8 relative z-10 w-fit">
              <Button className="cursor-pointer font-semibold text-xs h-9 px-5 bg-primary hover:bg-primary/95 text-white">
                {GLOBAL_TEXT.landing.ctaCandidate.btn}
              </Button>
            </Link>
          </div>

          {/* Employer Card */}
          <div className="bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 rounded-xl p-8 border border-zinc-250 dark:border-zinc-805 relative overflow-hidden flex flex-col justify-between group shadow-xxs">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-3xl -mr-8 -mt-8" />
            <div className="space-y-4 relative z-10">
              <span className="text-xxs font-bold text-primary uppercase tracking-widest">{GLOBAL_TEXT.landing.ctaRecruiter.badge}</span>
              <h3 className="text-xl font-bold tracking-tight">Connect with Premium Talent</h3>
              <p className="text-xs text-muted dark:text-zinc-400 leading-relaxed max-w-md">
                {GLOBAL_TEXT.landing.ctaRecruiter.desc}
              </p>
            </div>
            <Link href="/register/recruiter" className="mt-8 relative z-10 w-fit">
              <Button variant="outline" className="cursor-pointer font-semibold text-xs h-9 px-5 border-zinc-250 dark:border-zinc-750">
                {GLOBAL_TEXT.landing.ctaRecruiter.btn}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
