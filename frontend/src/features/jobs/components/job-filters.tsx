"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { JOB_TYPES } from "../constants/job.constants";
import { JOB_TEXT } from "../constants/job-text.constants";

interface JobFiltersProps {
  initialValues: {
    jobType?: string;
    location?: string;
    salaryMin?: string;
    salaryMax?: string;
    skills?: string;
  };
  onApply: (filters: {
    jobType?: string;
    location?: string;
    salaryMin?: string;
    salaryMax?: string;
    skills?: string;
  }) => void;
  onReset: () => void;
}

/**
 * Filter panel for location keyword checks, job types, salary thresholds, and skill qualifications.
 */
export function JobFilters({ initialValues, onApply, onReset }: JobFiltersProps) {
  const [jobType, setJobType] = useState(initialValues.jobType || "");
  const [location, setLocation] = useState(initialValues.location || "");
  const [salaryMin, setSalaryMin] = useState(initialValues.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(initialValues.salaryMax || "");
  const [skills, setSkills] = useState(initialValues.skills || "");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      jobType: jobType || undefined,
      location: location || undefined,
      salaryMin: salaryMin || undefined,
      salaryMax: salaryMax || undefined,
      skills: skills || undefined,
    });
  };

  const handleResetClick = () => {
    setJobType("");
    setLocation("");
    setSalaryMin("");
    setSalaryMax("");
    setSkills("");
    onReset();
  };

  return (
    <form
      onSubmit={handleApply}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-5"
    >
      <div className="flex items-center gap-2 font-bold text-sm text-ink dark:text-zinc-50 border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
        <Filter className="h-4 w-4 text-primary" />
        <span>{JOB_TEXT.filters.header}</span>
      </div>

      {/* 1. Job Type Select */}
      <div>
        <label htmlFor="filter-jobType" className="block text-xs font-semibold text-text dark:text-zinc-300 mb-1.5">
          {JOB_TEXT.filters.jobTypeLabel}
        </label>
        <select
          id="filter-jobType"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="w-full h-9 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        >
          <option value="" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900">{JOB_TEXT.filters.allJobTypesOption}</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900">
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Location Input */}
      <div>
        <label htmlFor="filter-location" className="block text-xs font-semibold text-text dark:text-zinc-300 mb-1.5">
          {JOB_TEXT.filters.locationLabel}
        </label>
        <input
          id="filter-location"
          type="text"
          placeholder={JOB_TEXT.filters.locationPlaceholder}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full h-9 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />
      </div>

      {/* 3. Salary Ranges */}
      <div>
        <label className="block text-xs font-semibold text-text dark:text-zinc-300 mb-1.5">
          {JOB_TEXT.filters.minSalaryLabel}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder={JOB_TEXT.filters.minSalaryPlaceholder}
            value={salaryMin}
            aria-label="Minimum salary filter"
            onChange={(e) => setSalaryMin(e.target.value)}
            className="w-full h-9 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          />
          <input
            type="number"
            min="0"
            placeholder={JOB_TEXT.filters.maxSalaryPlaceholder}
            value={salaryMax}
            aria-label="Maximum salary filter"
            onChange={(e) => setSalaryMax(e.target.value)}
            className="w-full h-9 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          />
        </div>
      </div>

      {/* 4. Skills Filters */}
      <div>
        <label htmlFor="filter-skills" className="block text-xs font-semibold text-text dark:text-zinc-300 mb-1.5">
          {JOB_TEXT.filters.skillsLabel}
        </label>
        <input
          id="filter-skills"
          type="text"
          placeholder={JOB_TEXT.filters.skillsPlaceholder}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full h-9 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <Button type="submit" className="flex-1 cursor-pointer h-9 text-xs">
          {JOB_TEXT.filters.applyBtn}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleResetClick}
          className="cursor-pointer h-9 px-3 flex items-center justify-center text-zinc-500 hover:text-zinc-700"
          aria-label={JOB_TEXT.filters.resetBtn}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

export default JobFilters;
