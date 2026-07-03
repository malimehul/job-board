"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRegister } from "../hooks/use-auth-mutations";
import { registerSchema, RegisterInput } from "../validators";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_TEXT } from "../constants/auth-text.constants";

interface RegisterFormProps {
  role: "Candidate" | "Recruiter";
}

/**
 * RegisterForm handles user registration without displaying role selection in UI.
 * Instead, role is passed as a prop from Candidate/Recruiter entry signup pages.
 */
export function RegisterForm({ role }: RegisterFormProps) {
  const { mutate: registerUser, isPending, error } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role,
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-card border border-zinc-200 dark:border-zinc-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink dark:text-zinc-50">
          {AUTH_TEXT.register.title(role)}
        </h2>
        <p className="text-sm text-muted mt-2">
          {role === "Candidate"
            ? AUTH_TEXT.register.subtitleCandidate
            : AUTH_TEXT.register.subtitleRecruiter}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-light border border-error text-error text-sm rounded-md">
          {error.message || AUTH_TEXT.register.errorMsg}
        </div>
      )}

      {/* noValidate disables standard HTML browser validation popups */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
        {/* Hidden field to bind prop role directly to hook-form submission */}
        <input type="hidden" value={role} {...register("role")} />

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text dark:text-zinc-300 mb-1"
          >
            {AUTH_TEXT.register.nameLabel} <span className="text-error">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder={AUTH_TEXT.register.namePlaceholder}
            {...register("name")}
            className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          />
          {/* Reserve space to prevent layout shifts */}
          <div className="min-h-[1.25rem] mt-1">
            {errors.name && (
              <p className="text-xs text-error">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text dark:text-zinc-300 mb-1"
          >
            {AUTH_TEXT.register.emailLabel} <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder={AUTH_TEXT.register.emailPlaceholder}
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text dark:text-zinc-300 mb-1"
          >
            {AUTH_TEXT.register.passwordLabel} <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={AUTH_TEXT.register.passwordPlaceholder}
              {...register("password")}
              className="w-full h-10 pl-3 pr-10 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer focus:outline-hidden focus-visible:text-primary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
          {isPending ? AUTH_TEXT.register.creatingAccountBtn : AUTH_TEXT.register.createAccountBtn}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted">{AUTH_TEXT.register.hasAccount}</span>
        <Link href="/login" className="text-primary hover:underline font-medium">
          {AUTH_TEXT.register.signInLink}
        </Link>
      </div>
    </div>
  );
}

export default RegisterForm;
