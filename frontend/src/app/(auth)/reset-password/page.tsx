"use client";

import ResetPasswordForm from "@/features/auth/components/reset-password-form";
import { useAuth } from "@/providers/auth-provider";
import Loader from "@/components/ui/loader";

export default function ResetPasswordPage() {
  const { user, isLoading } = useAuth();

  console.log('working****---', isLoading);
  // Show a full-screen loading spinner while verifying guest status
  if (isLoading || user) {
    return <Loader fullScreen={true} />;
  }

  return <ResetPasswordForm />;
}
