import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import { useAuthStore, checkOnboardingStatus } from "@/store/auth-store";
import { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from "../validators";
import { User, ApiResponse } from "@/types";

interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Custom hook to handle user login mutations.
 */
export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const response = await apiClient.post<ApiResponse<LoginResponseData>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response;
    },
    onSuccess: (response) => {
      if (response.status === "success" && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Save auth details globally (and in local storage / cookies)
        setAuth(user, accessToken, refreshToken);

        // Check if a redirection route is requested in query params
        const from = searchParams.get("from");
        if (from) {
          router.push(from);
          return;
        }

        const { profileCompleted, resumeUploaded } = checkOnboardingStatus(user);

        // Perform instant redirects based on authenticated user role and onboarding status
        if (user.role === "Admin") {
          router.push("/admin/dashboard");
        } else if (user.role === "Recruiter") {
          if (!profileCompleted) {
            router.push("/recruiter/onboarding");
          } else {
            router.push("/recruiter/dashboard");
          }
        } else {
          if (!profileCompleted) {
            router.push("/candidate/onboarding/profile");
          } else if (!resumeUploaded) {
            router.push("/candidate/onboarding/resume");
          } else {
            router.push("/jobs");
          }
        }
      }
    },
  });
}

/**
 * Custom hook to handle user registration mutations.
 */
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData: RegisterInput) => {
      const response = await apiClient.post<ApiResponse<{ user: User }>>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response;
    },
    onSuccess: () => {
      // Redirect to the login route with confirmation query parameter
      router.push("/login?registered=true");
    },
  });
}

/**
 * Custom hook to handle forgot password mutation.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const response = await apiClient.post<ApiResponse<null>>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data
      );
      return response;
    },
  });
}

/**
 * Custom hook to handle reset password mutation.
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ResetPasswordInput & { token: string }) => {
      const response = await apiClient.post<ApiResponse<null>>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          token: data.token,
          password: data.password,
        }
      );
      return response;
    },
    onSuccess: () => {
      router.push("/login?reset=true");
    },
  });
}
