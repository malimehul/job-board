"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLogin } from "../hooks/use-auth-mutations";
import { loginSchema, LoginInput } from "../validators";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_TEXT } from "../constants/auth-text.constants";

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  const searchParams = useSearchParams();
  const showRegisteredMsg = searchParams.get("registered") === "true";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-card border border-zinc-200 dark:border-zinc-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink dark:text-zinc-50">
          {AUTH_TEXT.login.title}
        </h2>
        <p className="text-sm text-muted mt-2">
          {AUTH_TEXT.login.subtitle}
        </p>
      </div>

      {showRegisteredMsg && (
        <div className="mb-4 p-3 bg-success-light border border-success text-success text-sm rounded-md">
          {AUTH_TEXT.login.successMsg}
        </div>
      )}

      {searchParams.get("reset") === "true" && (
        <div className="mb-4 p-3 bg-success-light border border-success text-success text-sm rounded-md">
          {AUTH_TEXT.login.resetSuccessMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-error-light border border-error text-error text-sm rounded-md">
          {error.message || AUTH_TEXT.login.errorMsg}
        </div>
      )}

      {/* noValidate disables standard HTML browser validation popups */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text dark:text-zinc-300 mb-1"
          >
            {AUTH_TEXT.login.emailLabel} <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder={AUTH_TEXT.login.emailPlaceholder}
            {...register("email")}
            className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          />
          {/* Reserve space to prevent layout shifts */}
          <div className="min-h-[1.25rem] mt-1">
            {errors.email && (
              <p className="text-xs text-error">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-text dark:text-zinc-300"
            >
              {AUTH_TEXT.login.passwordLabel} <span className="text-error">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={AUTH_TEXT.login.passwordPlaceholder}
              {...register("password")}
              className="w-full h-10 pl-3 pr-10 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer focus:outline-hidden focus-visible:text-primary transition-colors"
              aria-label={showPassword ? AUTH_TEXT.login.hidePassword : AUTH_TEXT.login.showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {/* Reserve space to prevent layout shifts */}
          <div className="min-h-[1.25rem] mt-1">
            {errors.password && (
              <p className="text-xs text-error">{errors.password.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? AUTH_TEXT.login.signingInBtn : AUTH_TEXT.login.signInBtn}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted">{AUTH_TEXT.login.noAccount}</span>
        <Link href="/register" className="text-primary hover:underline font-medium">
          {AUTH_TEXT.login.createAccount}
        </Link>
      </div>
    </div>
  );
}

export default LoginForm;
