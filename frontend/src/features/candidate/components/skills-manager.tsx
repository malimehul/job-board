"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Award } from "lucide-react";
import { CANDIDATE_TEXT } from "../constants/candidate-text.constants";

interface SkillsManagerProps {
  initialSkills: string[];
  onSave: (skills: string[]) => void;
  isPending: boolean;
}

/**
 * Interactive skills qualification badge manager.
 * Allows adding and deleting skills, tracking modification states before saving.
 */
export function SkillsManager({ initialSkills = [], onSave, isPending }: SkillsManagerProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [prevInitialSkills, setPrevInitialSkills] = useState<string[]>(initialSkills);

  if (JSON.stringify(initialSkills) !== JSON.stringify(prevInitialSkills)) {
    setSkills(initialSkills);
    setPrevInitialSkills(initialSkills);
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = newSkill.trim();

    if (!value) {
      setError(CANDIDATE_TEXT.skillsManager.enterSkillError);
      return;
    }

    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setError(CANDIDATE_TEXT.skillsManager.skillExistsError);
      return;
    }

    setSkills([...skills, value]);
    setNewSkill("");
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    setError(null);
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  // Check if skills have changed from initial values
  const hasChanges =
    skills.length !== initialSkills.length ||
    skills.some((s) => !initialSkills.includes(s));

  const handleSave = () => {
    onSave(skills);
  };

  return (
    <div className="space-y-6">
      {/* Input box */}
      <form onSubmit={handleAddSkill} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={CANDIDATE_TEXT.skillsManager.inputPlaceholder}
            value={newSkill}
            onChange={(e) => {
              setError(null);
              setNewSkill(e.target.value);
            }}
            className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          />
        </div>
        <Button type="submit" variant="outline" className="cursor-pointer h-10 px-4 flex items-center gap-1.5 border-zinc-250">
          <Plus className="h-4 w-4" />
          {CANDIDATE_TEXT.skillsManager.addSkillBtn}
        </Button>
      </form>

      <div className="min-h-[1.25rem]">
        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      {/* Badges Container */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-5">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Award className="h-4 w-4 text-zinc-400" />
          {CANDIDATE_TEXT.skillsManager.technicalBadgeHeader(skills.length)}
        </h3>

        {skills.length === 0 ? (
          <p className="text-xs text-muted italic">{CANDIDATE_TEXT.skillsManager.noSkillsYet}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-250 dark:border-zinc-700 rounded-md shadow-xxs"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="text-zinc-400 hover:text-error cursor-pointer rounded-full p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={`Remove skill ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Save Trigger */}
      <Button
        onClick={handleSave}
        disabled={isPending || !hasChanges}
        className="w-full cursor-pointer h-10 font-semibold"
      >
        {isPending ? CANDIDATE_TEXT.skillsManager.savingBtn : CANDIDATE_TEXT.skillsManager.saveBtn}
      </Button>
    </div>
  );
}

export default SkillsManager;
