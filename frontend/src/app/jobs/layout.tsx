"use client";

import React from "react";
import PublicLayout from "@/components/layouts/public-layout";

/**
 * Layout mapping for the public Job Board search/directory routes.
 */
export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
