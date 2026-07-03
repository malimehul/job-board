import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

/**
 * Checks Candidate Onboarding completion states.
 * If user is not a Candidate, onboarding is considered completed.
 */
export const checkOnboardingStatus = (user: User | null) => {
  if (!user) {
    return { profileCompleted: true, resumeUploaded: true };
  }
  if (user.role === "Candidate") {
    const profileCompleted = !!(
      user.profile?.title &&
      user.profile?.experience !== undefined &&
      user.profile?.skills &&
      user.profile.skills.length > 0
    );
    const resumeUploaded = !!user.profile?.resumeUrl;
    return { profileCompleted, resumeUploaded };
  }
  if (user.role === "Recruiter") {
    const profileCompleted = !!user.profile?.companyName;
    return { profileCompleted, resumeUploaded: true };
  }
  return { profileCompleted: true, resumeUploaded: true };
};

/**
 * Sets a cookie in the client browser.
 */
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
};

/**
 * Deletes a cookie in the client browser.
 */
const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        setAuth: (user, accessToken, refreshToken) => {
          // Sync tokens to cookies so they are accessible to server-rendered Next.js middleware
          setCookie("token", accessToken);
          setCookie("user-role", user.role);

          // Sync onboarding status cookies for Edge middleware redirects
          const { profileCompleted, resumeUploaded } = checkOnboardingStatus(user);
          setCookie("profile-completed", String(profileCompleted));
          setCookie("resume-uploaded", String(resumeUploaded));

          set({ user, accessToken, refreshToken });
        },
        clearAuth: () => {
          // Revoke cookies on sign out
          deleteCookie("token");
          deleteCookie("user-role");
          deleteCookie("profile-completed");
          deleteCookie("resume-uploaded");
          set({ user: null, accessToken: null, refreshToken: null });
        },
      }),
      {
        name: "job-portal-auth",
      }
    ),
    {
      name: "AuthStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

export default useAuthStore;
