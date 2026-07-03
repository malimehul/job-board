"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle, AlertTriangle, FileDown } from "lucide-react";
import { CANDIDATE_TEXT } from "../constants/candidate-text.constants";

interface ResumeManagerProps {
  resumeUrl?: string;
  onUpload: (file: File) => void;
  isPending: boolean;
  error?: Error | null;
}

/**
 * Reusable Drag & Drop resume document zone.
 * Displays active uploaded files, previews select values, and alerts size validations.
 */
export function ResumeManager({ resumeUrl, onUpload, isPending, error }: ResumeManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateAndSetFile = (file: File | undefined) => {
    setFileError(null);
    if (!file) return;

    // Check PDF types
    if (file.type !== "application/pdf") {
      setFileError(CANDIDATE_TEXT.resumeManager.onlyPdfError);
      setSelectedFile(null);
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError(CANDIDATE_TEXT.resumeManager.fileSizeError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError(CANDIDATE_TEXT.resumeManager.selectFileFirst);
      return;
    }
    onUpload(selectedFile);
  };

  return (
    <div className="space-y-6">
      {/* 1. Show existing resume if available */}
      {resumeUrl && (
        <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-success-light/10 text-success rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink dark:text-zinc-50">{CANDIDATE_TEXT.resumeManager.activeResumeHeader}</p>
              <p className="text-xxs text-muted mt-0.5">{CANDIDATE_TEXT.resumeManager.activeResumeSub}</p>
            </div>
          </div>
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button variant="outline" className="cursor-pointer h-9 px-4 text-xs flex items-center gap-1.5 border-zinc-250 w-full justify-center">
              <FileDown className="h-4 w-4" />
              {CANDIDATE_TEXT.resumeManager.downloadCurrentBtn}
            </Button>
          </a>
        </div>
      )}

      {/* 2. Upload Zone Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-bold text-ink dark:text-zinc-50">{CANDIDATE_TEXT.resumeManager.uploadNewHeader}</h3>

        {/* Dynamic error checks */}
        {(fileError || error) && (
          <div className="p-3 bg-error-light border border-error text-error text-sm rounded-md flex gap-2 items-center">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{fileError || error?.message || CANDIDATE_TEXT.resumeManager.failedToUpload}</span>
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer relative ${
            selectedFile
              ? "border-success bg-success-light/20 dark:bg-success-light/5"
              : "border-zinc-300 dark:border-zinc-700 hover:border-primary"
          }`}
        >
          <input
            id="resume-upload-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Upload resume file"
          />

          <div className="flex flex-col items-center justify-center">
            {selectedFile ? (
              <>
                <FileText className="h-12 w-12 text-success mb-4" />
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 block truncate max-w-xs">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-muted mt-1">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-success font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>{CANDIDATE_TEXT.resumeManager.readyForUpload}</span>
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {CANDIDATE_TEXT.resumeManager.dragAndDropText}
                  <span className="text-primary hover:underline">{CANDIDATE_TEXT.resumeManager.browseText}</span>
                </span>
                <span className="text-xs text-muted mt-2">{CANDIDATE_TEXT.resumeManager.pdfFilesOnlyLimit}</span>
              </>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !selectedFile}
          className="w-full cursor-pointer h-10 font-semibold flex items-center justify-center gap-2"
        >
          {isPending ? CANDIDATE_TEXT.resumeManager.submittingBtn : CANDIDATE_TEXT.resumeManager.submitBtn}
        </Button>
      </form>
    </div>
  );
}

export default ResumeManager;
