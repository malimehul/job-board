import { env } from "./env";
import { useAuthStore } from "@/store/auth-store";
import { ApiError, ValidationErrorDetail } from "./api-error";

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  _retry?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function request<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const baseUrl = env.NEXT_PUBLIC_API_URL;
  const targetUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  const { accessToken, refreshToken, clearAuth } = useAuthStore.getState();

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    body: isFormData
      ? (options.body as FormData)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  };

  try {
    let response = await fetch(targetUrl, fetchOptions);

    if (response.status === 401 && refreshToken) {
      if (!options._retry) {
        options._retry = true;

        const newAccessToken = await runTokenRefresh(refreshToken);
        if (newAccessToken) {
          headers.set("Authorization", `Bearer ${newAccessToken}`);
          response = await fetch(targetUrl, {
            ...fetchOptions,
            headers,
          });
        } else {
          clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new ApiError("Session has expired. Please log in again.", 401);
        }
      }
    }

    if (!response.ok) {
      let errorMsg = "An error occurred while communicating with the server.";
      let errors: unknown = undefined;

      try {
        const errBody = await response.json();
        errorMsg = errBody.message || errorMsg;
        errors = errBody.errors;
      } catch {
        // Fallback for non-JSON errors
      }

      throw new ApiError(errorMsg, response.status, errors as ValidationErrorDetail[] | undefined);
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    const json = await response.json();
    return json;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : "Network request failed", 500);
  }
}

async function runTokenRefresh(token: string): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: token }),
      });

      if (!res.ok) {
        throw new Error("Unable to refresh session");
      }

      const body = await res.json();
      if (body.status === "success" && body.data) {
        const { accessToken, refreshToken: newRefreshToken } = body.data;
        const currentProfile = useAuthStore.getState().user;

        useAuthStore.getState().setAuth(
          currentProfile!,
          accessToken,
          newRefreshToken
        );
        return accessToken;
      }
      return null;
    } catch {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const apiClient = {
  get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body?: unknown, options?: RequestInit) => request<T>(url, { ...options, method: "POST", body }),
  put: <T>(url: string, body?: unknown, options?: RequestInit) => request<T>(url, { ...options, method: "PUT", body }),
  patch: <T>(url: string, body?: unknown, options?: RequestInit) => request<T>(url, { ...options, method: "PATCH", body }),
  delete: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: "DELETE" }),
};

export default apiClient;
