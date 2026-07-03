"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "../hooks/use-auth-mutations";
import { resetPasswordSchema, ResetPasswordInput } from "../validators";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_TEXT } from "../constants/auth-text.constants";

export function ResetPasswordForm() {
  const { mutate: resetPassword, isPending, error } = useResetPassword();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    if (!token) {
      return;
    }
    resetPassword({ ...data, token });
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-card border border-zinc-200 dark:border-zinc-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink dark:text-zinc-50">
          {AUTH_TEXT.resetPassword.title}
        </h2>
        <p className="text-sm text-muted mt-2">
          {AUTH_TEXT.resetPassword.subtitle}
        </p>
      </div>

      {!token ? (
        <div className="mb-4 p-3 bg-error-light border border-error text-error text-sm rounded-md text-center">
          Invalid or missing reset token. Please request a new password reset link.
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-error-light border border-error text-error text-sm rounded-md">
              {error.message || "An error occurred. Please try again."}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text dark:text-zinc-300 mb-1"
              >
                {AUTH_TEXT.resetPassword.passwordLabel} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={AUTH_TEXT.resetPassword.passwordPlaceholder}
                  {...register("password")}
                  className="w-full h-10 pl-3 pr-10 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer focus:outline-hidden focus-visible:text-primary transition-colors"
                  aria-label={showPassword ? AUTH_TEXT.resetPassword.hidePassword : AUTH_TEXT.resetPassword.showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="min-h-[1.25rem] mt-1">
                {errors.password && (
                  <p className="text-xs text-error">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text dark:text-zinc-300 mb-1"
              >
                {AUTH_TEXT.resetPassword.confirmPasswordLabel} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={AUTH_TEXT.resetPassword.confirmPasswordPlaceholder}
                  {...register("confirmPassword")}
                  className="w-full h-10 pl-3 pr-10 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer focus:outline-hidden focus-visible:text-primary transition-colors"
                  aria-label={showConfirmPassword ? AUTH_TEXT.resetPassword.hidePassword : AUTH_TEXT.resetPassword.showPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="min-h-[1.25rem] mt-1">
                {errors.confirmPassword && (
                  <p className="text-xs text-error">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? AUTH_TEXT.resetPassword.submittingBtn : AUTH_TEXT.resetPassword.submitBtn}
            </Button>
          </form>
        </>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-primary hover:underline font-medium">
          {AUTH_TEXT.resetPassword.backToLogin}
        </Link>
      </div>
    </div>
  );
}

export default ResetPasswordForm;
