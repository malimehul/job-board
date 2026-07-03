"use client";

import LoginForm from "@/features/auth/components/login-form";
import { useAuth } from "@/providers/auth-provider";
import Loader from "@/components/ui/loader";


export default function LoginPage() {
  const { user, isLoading } = useAuth();

  // Show a full-screen loading spinner while verifying guest status
  if (isLoading || user) {
    return <Loader fullScreen={true} />
  }

  return <LoginForm />

}
