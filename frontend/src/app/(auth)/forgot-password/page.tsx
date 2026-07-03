"use client";

import ForgotPasswordForm from "@/features/auth/components/forgot-password-form";
import { useAuth } from "@/providers/auth-provider";
import Loader from "@/components/ui/loader";

export default function ForgotPasswordPage() {
  const { user, isLoading } = useAuth();

  // Show a full-screen loading spinner while verifying guest status
  if (isLoading || user) {
    return <Loader fullScreen={true} />;
  }

  return <ForgotPasswordForm />;
}
