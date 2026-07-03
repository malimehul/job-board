"use client";

import React, { useState } from "react";
import { Application } from "@/types";
import { Button } from "@/components/ui/button";
import { X, Check, Award, Briefcase, Calendar, Ban, UserCheck } from "lucide-react";
import { APPLICATION_TEXT } from "../constants/application-text.constants";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: Application["status"];
  onUpdate: (status: Application["status"]) => void;
  isPending: boolean;
}

const statusOptions: {
  value: Application["status"];
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}[] = [
  {
    value: "Applied",
    icon: Briefcase,
    colorClass: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800",
  },
  {
    value: "Shortlisted",
    icon: Award,
    colorClass: "text-blue-500 bg-blue-100 dark:bg-blue-950/20",
  },
  {
    value: "Interviewed",
    icon: Calendar,
    colorClass: "text-purple-500 bg-purple-100 dark:bg-purple-955/20",
  },
  {
    value: "Hired",
    icon: UserCheck,
    colorClass: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/20",
  },
  {
    value: "Rejected",
    icon: Ban,
    colorClass: "text-rose-500 bg-rose-100 dark:bg-rose-955/20",
  },
];

/**
 * Premium StatusModal component.
 * Prompts recruiter users with status transitions, showing status summaries.
 */
export function StatusModal({ isOpen, onClose, currentStatus, onUpdate, isPending }: StatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<Application["status"]>(currentStatus);
  const [prevCurrentStatus, setPrevCurrentStatus] = useState<Application["status"]>(currentStatus);

  if (currentStatus !== prevCurrentStatus) {
    setSelectedStatus(currentStatus);
    setPrevCurrentStatus(currentStatus);
  }

  if (!isOpen) return null;

  const handleConfirm = () => {
    onUpdate(selectedStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-card w-full max-w-md overflow-hidden animate-slide-up z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-150 dark:border-zinc-800/80 mb-4">
          <div>
            <h3 className="text-md font-bold text-ink dark:text-zinc-50">{APPLICATION_TEXT.statusModal.title}</h3>
            <p className="text-xxs text-muted mt-0.5">{APPLICATION_TEXT.statusModal.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer focus:outline-hidden"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options list */}
        <div className="space-y-2">
          {statusOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedStatus === opt.value;
            const textKey = opt.value.toLowerCase() as keyof typeof APPLICATION_TEXT.statusModal.options;
            const label = APPLICATION_TEXT.statusModal.options[textKey].label;
            const description = APPLICATION_TEXT.statusModal.options[textKey].desc;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary-light/10 dark:bg-primary-light/5"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-transparent"
                }`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${opt.colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink dark:text-zinc-50">{label}</p>
                  <p className="text-[10px] text-muted mt-0.5 truncate">{description}</p>
                </div>
                {isSelected && (
                  <div className="h-5 w-5 bg-primary text-white rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 justify-end border-t border-zinc-150 dark:border-zinc-800/80 pt-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer text-xs h-9 px-4"
          >
            {APPLICATION_TEXT.statusModal.cancelBtn}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || selectedStatus === currentStatus}
            className="cursor-pointer text-xs h-9 px-4 font-semibold"
          >
            {isPending ? APPLICATION_TEXT.statusModal.applyingStatus : APPLICATION_TEXT.statusModal.applyBtn}
          </Button>
        </div>
      </div>
    </div>
  );
}
export default StatusModal;
