"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobSearchProps {
  initialValue: string;
  onSearch: (keyword: string) => void;
}

/**
 * Text search query input bar with debounced search trigger and quick clear.
 */
export function JobSearch({ initialValue, onSearch }: JobSearchProps) {
  const [value, setValue] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (initialValue !== prevInitialValue) {
    setValue(initialValue);
    setPrevInitialValue(initialValue);
  }

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear any pending timeout when user continues typing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Trigger search after 500ms of inactivity
    timeoutRef.current = setTimeout(() => {
      onSearch(newValue.trim());
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any pending timeout since we're triggering immediately
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue("");
    // Clear any pending timeout since we're clearing immediately
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
          <Search className="h-4 w-4" />
        </span>

        <input
          type="text"
          placeholder="Search jobs by title, description or skills keywords..."
          value={value}
          onChange={handleChange}
          className="w-full h-10 pl-10 pr-10 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer focus:outline-hidden"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* <Button type="submit" className="cursor-pointer h-10 px-6 font-semibold">
        Search
      </Button> */}
    </form>
  );
}

export default JobSearch;
