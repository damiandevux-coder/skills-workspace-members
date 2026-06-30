"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  HardDrive,
  Bot,
  ArrowLeft,
  Upload,
  FolderOpen,
  File,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_SHARED_KNOWLEDGE } from "@/data/mock-shared-knowledge";
import { KnowledgeItem, SharedKnowledge } from "@/types/skills";

function KnowledgeTree({
  item,
  depth = 0,
}: {
  item: KnowledgeItem;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFolder = item.type === "folder";

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-md py-1.5 px-2 hover:bg-[#151519] cursor-pointer transition-colors"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => isFolder && setExpanded(!expanded)}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-[#85858e]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-[#85858e]" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        {isFolder ? (
          expanded ? (
            <FolderOpen className="h-4 w-4 text-[#f5c45e]" />
          ) : (
            <Folder className="h-4 w-4 text-[#85858e]" />
          )
        ) : (
          <File className="h-4 w-4 text-[#a7a7ad]" />
        )}
        <span className="text-[13px] text-[#f5f5f5] min-w-0 flex-1 truncate">{item.name}</span>
        {item.size && <span className="text-[10px] text-[#85858e]">{item.size}</span>}
      </div>
      <AnimatePresence>
        {isFolder && expanded && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children.map((child) => (
              <KnowledgeTree key={child.id} item={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KnowledgeCard({ knowledge }: { knowledge: SharedKnowledge }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const fileCount = useMemo(() => {
    let count = 0;
    const countFiles = (items: KnowledgeItem[]) => {
      items.forEach((item) => {
        if (item.type === "file") count++;
        if (item.children) countFiles(item.children);
      });
    };
    countFiles(knowledge.items);
    return count;
  }, [knowledge.items]);

  const folderCount = useMemo(() => {
    let count = 0;
    const countFolders = (items: KnowledgeItem[]) => {
      items.forEach((item) => {
        if (item.type === "folder") {
          count++;
          if (item.children) countFolders(item.children);
        }
      });
    };
    countFolders(knowledge.items);
    return count;
  }, [knowledge.items]);

  return (
    <motion.div
      layout
      className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden transition-colors hover:border-[#3d3d40]"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
          <span className="text-lg">{knowledge.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-[#f5f5f5]">{knowledge.name}</h3>
          <p className="text-xs text-[#85858e] mt-0.5">{knowledge.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#85858e]">
            <HardDrive className="h-3 w-3" />
            {fileCount} files
            {folderCount > 0 && `, ${folderCount} folders`}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#85858e]">
            <Bot className="h-3 w-3" />
            {knowledge.assignedAgents.length} agent{knowledge.assignedAgents.length !== 1 ? "s" : ""}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[#85858e]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#85858e]" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#222226] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
                  Contents
                </h4>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors">
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors">
                    <Plus className="h-3 w-3" />
                    New Folder
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-[#222226] bg-[#101010]">
                {knowledge.items.map((item) => (
                  <KnowledgeTree key={item.id} item={item} />
                ))}
              </div>

              {/* Assigned Agents */}
              <div className="mt-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e] mb-2">
                  Assigned Agents
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {knowledge.assignedAgents.map((agent) => (
                    <span
                      key={agent}
                      className="inline-flex items-center gap-1 rounded-full bg-[#151519] border border-[#303036] px-2.5 py-1 text-[11px] text-[#a7a7ad]"
                    >
                      <Bot className="h-3 w-3" />
                      {agent}
                    </span>
                  ))}
                  <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#303036] px-2.5 py-1 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors">
                    <Plus className="h-3 w-3" />
                    Assign Agent
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SharedKnowledgePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_SHARED_KNOWLEDGE;
    const q = searchQuery.toLowerCase();
    return MOCK_SHARED_KNOWLEDGE.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#070708]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm text-[#85858e] hover:text-[#f5f5f5] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Skills
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#f5f5f5]">Shared Knowledge</h1>
              <p className="text-sm text-[#85858e] mt-1">
                Knowledge bases that agents can access and reference during conversations.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#111111] transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" />
              New Knowledge Base
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#85858e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge bases..."
              className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] pl-10 pr-4 text-sm text-[#f5f5f5] outline-none placeholder:text-[#85858e] focus:border-[#5a5a5e]"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="space-y-3">
          {filtered.map((knowledge) => (
            <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-[#333333] bg-[#181818] px-5 py-12 text-center">
            <HardDrive className="mx-auto mb-3 h-5 w-5 text-[#696969]" />
            <p className="text-sm text-[#85858e]">No knowledge bases match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
