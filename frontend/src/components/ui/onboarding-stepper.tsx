"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: 1 | 2;
}

/**
 * Premium horizontal Stepper component to visually guide Candidates
 * through the mandatory 2-step onboarding flow.
 */
export function OnboardingStepper({ currentStep }: StepperProps) {
  const steps = [
    { number: 1, label: "Basic Profile", description: "Skills and experience" },
    { number: 2, label: "Resume Upload", description: "PDF or Word document" },
  ];

  return (
    <div className="w-full max-w-lg mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        {/* Connector Line Background */}
        <div className="absolute left-0 right-0 top-5 -translate-y-1/2 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />

        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 px-4 relative z-10">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors ${
                  isCompleted
                    ? "bg-success border-success text-white"
                    : isActive
                    ? "bg-primary border-primary text-white animate-pulse"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600"
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.number}
              </div>
              <span
                className={`text-sm font-medium mt-2 transition-colors ${
                  isActive || isCompleted
                    ? "text-ink dark:text-zinc-50"
                    : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OnboardingStepper;
