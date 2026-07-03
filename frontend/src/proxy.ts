import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth token and user role cookies
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("user-role")?.value;
  const profileCompleted = request.cookies.get("profile-completed")?.value === "true";
  const resumeUploaded = request.cookies.get("resume-uploaded")?.value === "true";

  // Route classifications
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isCandidateRoute = pathname.startsWith("/candidate");
  const isRecruiterRoute = pathname.startsWith("/recruiter");
  const isAdminRoute = pathname.startsWith("/admin");

  // 1. If logged in and accessing auth routes (login/register), redirect to dashboard/jobs
  if (token && role && isAuthRoute) {
    if (role === "Admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "Recruiter") {
      if (!profileCompleted) {
        return NextResponse.redirect(new URL("/recruiter/onboarding", request.url));
      }
      return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
    }
    if (role === "Candidate") {
      if (!profileCompleted) {
        return NextResponse.redirect(new URL("/candidate/onboarding/profile", request.url));
      }
      if (!resumeUploaded) {
        return NextResponse.redirect(new URL("/candidate/onboarding/resume", request.url));
      }
      return NextResponse.redirect(new URL("/jobs", request.url));
    }
  }

  // 2. If NOT logged in and accessing protected dashboard paths, redirect to login
  if (!token && (isCandidateRoute || isRecruiterRoute || isAdminRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Candidate onboarding flow enforcement (CRITICAL)
  if (token && role === "Candidate") {
    const isOnboardingProfileRoute = pathname === "/candidate/onboarding/profile";
    const isOnboardingResumeRoute = pathname === "/candidate/onboarding/resume";
    const isOnboardingRoute = isOnboardingProfileRoute || isOnboardingResumeRoute;

    if (!profileCompleted) {
      // Force user to profile onboarding page if not completed
      if (!isOnboardingProfileRoute) {
        return NextResponse.redirect(new URL("/candidate/onboarding/profile", request.url));
      }
    } else if (!resumeUploaded) {
      // Force user to resume onboarding page if profile is done but resume is not
      if (!isOnboardingResumeRoute) {
        return NextResponse.redirect(new URL("/candidate/onboarding/resume", request.url));
      }
    } else {
      // If both completed, block access to onboarding sub-paths
      if (isOnboardingRoute) {
        return NextResponse.redirect(new URL("/jobs", request.url));
      }
    }
  }

  // 4. Recruiter onboarding flow enforcement (CRITICAL)
  if (token && role === "Recruiter") {
    const isOnboardingRoute = pathname === "/recruiter/onboarding";

    if (!profileCompleted) {
      // Force user to recruiter onboarding page if not completed
      if (!isOnboardingRoute) {
        return NextResponse.redirect(new URL("/recruiter/onboarding", request.url));
      }
    } else {
      // If completed, block access to onboarding path
      if (isOnboardingRoute) {
        return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
      }
    }
  }

  // 4. Cross-role protection: prevent candidates accessing recruiter paths, etc.
  if (token && role) {
    if (isCandidateRoute && role !== "Candidate") {
      return NextResponse.redirect(
        new URL(role === "Admin" ? "/admin/dashboard" : "/recruiter/dashboard", request.url)
      );
    }
    if (isRecruiterRoute && role !== "Recruiter") {
      return NextResponse.redirect(
        new URL(role === "Admin" ? "/admin/dashboard" : "/jobs", request.url)
      );
    }
    if (isAdminRoute && role !== "Admin") {
      return NextResponse.redirect(
        new URL(role === "Recruiter" ? "/recruiter/dashboard" : "/jobs", request.url)
      );
    }
  }

  return NextResponse.next();
}

// Intercept specific routes to reduce performance overhead on static assets/images
export const config = {
  matcher: [
    "/login",
    "/register",
    "/register/:path*",
    "/candidate/:path*",
    "/recruiter/:path*",
    "/admin/:path*",
    "/jobs",
    "/jobs/:path*",
  ],
};

export default proxy;
