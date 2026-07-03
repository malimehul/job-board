"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForgotPassword } from "../hooks/use-auth-mutations";
import { forgotPasswordSchema, ForgotPasswordInput } from "../validators";
import { Button } from "@/components/ui/button";
import { AUTH_TEXT } from "../constants/auth-text.constants";

export function ForgotPasswordForm() {
  const { mutate: forgotPassword, isPending, error, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword(data);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-card border border-zinc-200 dark:border-zinc-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink dark:text-zinc-50">
          {AUTH_TEXT.forgotPassword.title}
        </h2>
        <p className="text-sm text-muted mt-2">
          {AUTH_TEXT.forgotPassword.subtitle}
        </p>
      </div>

      {isSuccess && (
        <div className="mb-4 p-3 bg-success-light border border-success text-success text-sm rounded-md">
          {AUTH_TEXT.forgotPassword.successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-error-light border border-error text-error text-sm rounded-md">
          {error.message || "An error occurred. Please try again."}
        </div>
      )}

      {!isSuccess && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text dark:text-zinc-300 mb-1"
            >
              {AUTH_TEXT.forgotPassword.emailLabel} <span className="text-error">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder={AUTH_TEXT.forgotPassword.emailPlaceholder}
              {...register("email")}
              className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <div className="min-h-[1.25rem] mt-1">
              {errors.email && (
                <p className="text-xs text-error">{errors.email.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? AUTH_TEXT.forgotPassword.submittingBtn : AUTH_TEXT.forgotPassword.submitBtn}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-primary hover:underline font-medium">
          {AUTH_TEXT.forgotPassword.backToLogin}
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
