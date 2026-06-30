"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { HardDrive } from "lucide-react";
import { SkillGrid } from "@/components/SkillGrid";
import { SkillCreationModal } from "@/components/SkillCreationModal";
import { ImportSkillModal } from "@/components/ImportSkillModal";
import { ToastContainer, type Toast } from "@/components/Toast";
import { MOCK_INSTALLED_SKILLS, MOCK_LIBRARY_SKILLS } from "@/data/mock-skills";

export default function Home() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <main className="min-h-screen bg-[#070708]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => router.push("/shared-knowledge")}
            className="inline-flex items-center gap-2 rounded-lg border border-[#303036] bg-[#151519] px-3 py-1.5 text-[11px] font-medium text-[#85858e] transition-colors hover:text-[#f5f5f5] hover:border-[#5a5a5e]"
          >
            <HardDrive className="h-3.5 w-3.5" />
            Shared Knowledge
          </button>
        </div>
        <SkillGrid
          installedSkills={MOCK_INSTALLED_SKILLS}
          librarySkills={MOCK_LIBRARY_SKILLS}
          onCreateSkill={() => setIsCreateModalOpen(true)}
          onImportSkill={() => setIsImportModalOpen(true)}
        />
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <SkillCreationModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onToast={addToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImportModalOpen && (
          <ImportSkillModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onToast={addToast}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
