"use client";

import RegisterForm from "@/features/auth/components/register-form";
import { useAuth } from "@/providers/auth-provider";
import Loader from "@/components/ui/loader";

export default function CandidateRegisterPage() {
  const { user, isLoading } = useAuth();

  // Show a full-screen loading spinner while verifying guest status
  if (isLoading || user) {
    return <Loader fullScreen={true} />
  }

  return <RegisterForm role="Candidate" />;
}
