# True Workspaces Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/workspaces` UX prototype demonstrating workspaces as isolated contexts (own agents + shared knowledge each), with a sidebar dropdown switcher, instant creation modal, and workspace-scoped knowledge page — leaving all existing prototype routes untouched.

**Architecture:** A `WorkspaceProvider` React context owns all workspace-scoped mock state. New routes live under `src/app/workspaces/` with their own `WorkspaceAppShell`. A small `ShellGate` client component in the root layout routes `/workspaces/*` around the old `AppShell`. The knowledge page is a copy of the existing shared-knowledge page adapted to context, plus file-status chips.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19.2.4, TypeScript, Tailwind (inline arbitrary values), framer-motion, lucide-react. Mock data only — no network.

**Spec:** `docs/superpowers/specs/2026-07-08-true-workspaces-prototype-design.md`

## Global Constraints

- Next.js is **16.2.9** and differs from common conventions — after `npm install`, read the relevant guide in `node_modules/next/dist/docs/` before writing any route/layout code (repo rule from AGENTS.md).
- **No new dependencies.** Only what's in package.json.
- **Do not change existing page behavior.** Additive-only changes to shared files, exactly three: optional `status` on `KnowledgeItem`, optional `onCreated` prop on `AgentCreationModal`, optional `agents` prop on `NewKnowledgeBaseModal`, plus the `ShellGate` swap in `src/app/layout.tsx`.
- **Visual language** (copy from existing components, do not invent): page bg `#070708`, surface `#0b0b0c`, raised `#151519`/`#101010`, borders `#303036` (strong) / `#222226` (subtle), text `#f5f5f5` / `#a7a7ad` / `#85858e`, accent green `#4ade80`, amber `#f5c45e`, red `#ef4444`. Nav text 13px. Section labels: `text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]`.
- **No test infra exists.** Verification = `npm run build` passing + manual checks against `npm run dev` (default http://localhost:3000). Each task lists its exact manual checks.
- All state in memory; refresh resets to mocks. `Date.now()` for ids is fine.
- Commit after every task. **Never push** — commits stay local unless Damian asks.
- Path alias `@/*` → `src/*` is configured; use `@/` imports like the rest of the repo.

---

### Task 1: Environment setup and baseline

**Files:** none created; verifies the repo builds before any change.

**Interfaces:**
- Consumes: nothing.
- Produces: installed `node_modules`, a known-green `npm run build` baseline.

- [ ] **Step 1: Install dependencies**

Run: `cd /home/damian/hypercli-all-repos/skill-creation-prototype && npm install`
Expected: completes without errors; `node_modules/` exists.

- [ ] **Step 2: Read the Next.js 16 docs relevant to this plan**

Run: `ls node_modules/next/dist/docs/`
Read the guides covering: App Router layouts, `"use client"` components, `next/navigation` (`usePathname`, `useRouter`). This repo's AGENTS.md warns conventions differ from training data — trust these docs over memory.

- [ ] **Step 3: Baseline build**

Run: `npm run build`
Expected: `✓ Compiled successfully` (or this version's equivalent success output), exit code 0. If the baseline fails, STOP and report — do not fix pre-existing breakage inside this plan.

- [ ] **Step 4: Baseline visual check**

Run: `npm run dev` and open http://localhost:3000 and http://localhost:3000/shared-knowledge — both render. Keep the dev server running for later tasks.

*(No commit — nothing changed.)*

---

### Task 2: Types and mock workspace data

**Files:**
- Modify: `src/types/skills.ts` (add one optional field to `KnowledgeItem`)
- Create: `src/types/workspaces.ts`
- Create: `src/data/mock-workspaces.ts`

**Interfaces:**
- Consumes: `SharedKnowledge`, `KnowledgeItem` from `@/types/skills`.
- Produces: `WorkspaceAgent { id, name, status: "ready" | "busy" | "offline" }`, `Workspace { id, name, emoji, color, agents: WorkspaceAgent[], knowledgeBases: SharedKnowledge[] }`, `WORKSPACE_EMOJI_OPTIONS: string[]`, `WORKSPACE_COLOR_OPTIONS: string[]`, `MOCK_WORKSPACES: Workspace[]` (Marketing first — it's the default active workspace), `KnowledgeItem.status?: "ready" | "processing" | "queued" | "failed"`.

- [ ] **Step 1: Add optional `status` to `KnowledgeItem`**

In `src/types/skills.ts`, change the `KnowledgeItem` interface (lines 65–74) to:

```ts
export interface KnowledgeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  emoji?: string;
  size?: string;
  modified?: string;
  children?: KnowledgeItem[];
  content?: string;
  /** Conversion lifecycle for files. Absent means ready. Folders never carry a status. */
  status?: "ready" | "processing" | "queued" | "failed";
}
```

- [ ] **Step 2: Create `src/types/workspaces.ts`**

```ts
import { SharedKnowledge } from "./skills";

export interface WorkspaceAgent {
  id: string;
  name: string;
  status: "ready" | "busy" | "offline";
}

export interface Workspace {
  id: string;
  name: string;
  emoji: string;
  color: string; // accent hex used to tint the switcher avatar
  agents: WorkspaceAgent[];
  knowledgeBases: SharedKnowledge[];
}

export const WORKSPACE_EMOJI_OPTIONS = ["🟣", "🔵", "🟢", "🟠", "🎨", "🚀", "🧠", "📣"];

export const WORKSPACE_COLOR_OPTIONS = [
  "#a78bfa",
  "#60a5fa",
  "#4ade80",
  "#fb923c",
  "#f472b6",
  "#f5c45e",
];
```

- [ ] **Step 3: Create `src/data/mock-workspaces.ts`**

Two workspaces with visibly different agents/knowledge so switching is obvious. Marketing carries the mixed file statuses (processing / queued / failed) that exercise the status UX; Tech is mostly ready.

```ts
import { Workspace } from "@/types/workspaces";

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws-marketing",
    name: "Marketing",
    emoji: "🟣",
    color: "#a78bfa",
    agents: [
      { id: "agent-copywriter", name: "Copywriter", status: "ready" },
      { id: "agent-brand-analyst", name: "Brand Analyst", status: "busy" },
    ],
    knowledgeBases: [
      {
        id: "kb-brand-assets",
        name: "Brand Assets",
        description: "Logos, color palettes, typography, and brand guidelines",
        emoji: "🎨",
        items: [
          { id: "mk-logo", name: "hyperclaw-logo.svg", type: "file", size: "12 KB", modified: "2026-05-15", status: "ready" },
          { id: "mk-colors", name: "Color Palette.md", type: "file", size: "8 KB", modified: "2026-05-15", status: "ready" },
          { id: "mk-typography", name: "Typography.md", type: "file", size: "15 KB", modified: "2026-05-20", status: "ready" },
        ],
        assignedAgents: ["Copywriter"],
      },
      {
        id: "kb-campaign-research",
        name: "Campaign Research",
        description: "Competitor analysis, focus groups, and Q3 campaign briefs",
        emoji: "📊",
        items: [
          { id: "mk-competitors", name: "Competitor Analysis.pdf", type: "file", size: "1.2 MB", modified: "2026-07-07", status: "processing" },
          {
            id: "mk-briefs",
            name: "Q3 Briefs",
            type: "folder",
            modified: "2026-07-08",
            children: [
              { id: "mk-brief-launch", name: "Launch Brief.docx", type: "file", size: "88 KB", modified: "2026-07-08", status: "queued" },
              { id: "mk-brief-social", name: "Social Campaign.md", type: "file", size: "24 KB", modified: "2026-07-06", status: "ready" },
            ],
          },
          { id: "mk-focus-group", name: "Focus Group Notes.docx", type: "file", size: "310 KB", modified: "2026-07-05", status: "failed" },
        ],
        assignedAgents: ["Copywriter", "Brand Analyst"],
      },
    ],
  },
  {
    id: "ws-tech",
    name: "Tech",
    emoji: "🔵",
    color: "#60a5fa",
    agents: [
      { id: "agent-product-owner", name: "Product Owner", status: "ready" },
      { id: "agent-code-reviewer", name: "Code Reviewer", status: "ready" },
      { id: "agent-sre", name: "SRE Agent", status: "offline" },
    ],
    knowledgeBases: [
      {
        id: "kb-api-docs",
        name: "API Documentation",
        description: "Internal API references, endpoints, and integration guides",
        emoji: "🔌",
        items: [
          { id: "tk-openapi", name: "openapi.yaml", type: "file", size: "156 KB", modified: "2026-06-22", status: "ready" },
          {
            id: "tk-guides",
            name: "Integration Guides",
            type: "folder",
            modified: "2026-06-15",
            children: [
              { id: "tk-auth", name: "Authentication.md", type: "file", size: "22 KB", modified: "2026-06-15", status: "ready" },
              { id: "tk-limits", name: "Rate Limits.md", type: "file", size: "18 KB", modified: "2026-06-14", status: "ready" },
            ],
          },
        ],
        assignedAgents: ["Product Owner", "Code Reviewer"],
      },
      {
        id: "kb-runbooks",
        name: "Runbooks",
        description: "Operational procedures, incident response, and troubleshooting",
        emoji: "📋",
        items: [
          { id: "tk-incident", name: "Incident Response.md", type: "file", size: "67 KB", modified: "2026-06-01", status: "ready" },
          { id: "tk-deploy", name: "Deployment Procedures.md", type: "file", size: "54 KB", modified: "2026-05-28", status: "processing" },
        ],
        assignedAgents: ["SRE Agent"],
      },
    ],
  },
];
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: success, exit 0. (Types only — nothing renders yet.)

- [ ] **Step 5: Commit**

```bash
git add src/types/skills.ts src/types/workspaces.ts src/data/mock-workspaces.ts
git commit -m "feat: workspace types and mock data for true-workspaces prototype"
```

---

### Task 3: WorkspaceProvider context

**Files:**
- Create: `src/components/workspaces/WorkspaceProvider.tsx`

**Interfaces:**
- Consumes: `Workspace`, `WorkspaceAgent` from `@/types/workspaces`; `SharedKnowledge`, `KnowledgeItem` from `@/types/skills`; `MOCK_WORKSPACES` from `@/data/mock-workspaces`.
- Produces (used by every later task):
  - `WorkspaceProvider({ children })` component
  - `useWorkspace()` hook returning `{ workspaces: Workspace[]; activeWorkspace: Workspace; switchWorkspace(id: string): void; createWorkspace(data: { name: string; emoji: string; color: string }): Workspace; addAgent(name: string): void; addKnowledgeBase(data: { name: string; description: string; emoji: string; assignedAgents: string[] }): void; retryFile(knowledgeBaseId: string, fileId: string): void }`

- [ ] **Step 1: Create the provider**

```tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { Workspace, WorkspaceAgent } from "@/types/workspaces";
import { KnowledgeItem, SharedKnowledge } from "@/types/skills";
import { MOCK_WORKSPACES } from "@/data/mock-workspaces";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  switchWorkspace: (id: string) => void;
  createWorkspace: (data: { name: string; emoji: string; color: string }) => Workspace;
  addAgent: (name: string) => void;
  addKnowledgeBase: (data: {
    name: string;
    description: string;
    emoji: string;
    assignedAgents: string[];
  }) => void;
  retryFile: (knowledgeBaseId: string, fileId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}

function setFileStatus(
  items: KnowledgeItem[],
  fileId: string,
  status: NonNullable<KnowledgeItem["status"]>
): KnowledgeItem[] {
  return items.map((item) => {
    if (item.id === fileId && item.type === "file") return { ...item, status };
    if (item.children) return { ...item, children: setFileStatus(item.children, fileId, status) };
    return item;
  });
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(MOCK_WORKSPACES[0].id);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  const switchWorkspace = (id: string) => setActiveWorkspaceId(id);

  const createWorkspace = (data: { name: string; emoji: string; color: string }): Workspace => {
    const ws: Workspace = {
      id: `ws-${Date.now()}`,
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      agents: [],
      knowledgeBases: [],
    };
    setWorkspaces((prev) => [...prev, ws]);
    setActiveWorkspaceId(ws.id);
    return ws;
  };

  const addAgent = (name: string) => {
    const agent: WorkspaceAgent = { id: `agent-${Date.now()}`, name, status: "ready" };
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === activeWorkspace.id ? { ...w, agents: [...w.agents, agent] } : w))
    );
  };

  const addKnowledgeBase = (data: {
    name: string;
    description: string;
    emoji: string;
    assignedAgents: string[];
  }) => {
    const kb: SharedKnowledge = { id: `kb-${Date.now()}`, ...data, items: [] };
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id ? { ...w, knowledgeBases: [kb, ...w.knowledgeBases] } : w
      )
    );
  };

  const retryFile = (knowledgeBaseId: string, fileId: string) => {
    const workspaceId = activeWorkspace.id;
    const applyStatus = (status: NonNullable<KnowledgeItem["status"]>) =>
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                knowledgeBases: w.knowledgeBases.map((kb) =>
                  kb.id === knowledgeBaseId
                    ? { ...kb, items: setFileStatus(kb.items, fileId, status) }
                    : kb
                ),
              }
            : w
        )
      );
    applyStatus("processing");
    // Mock conversion: succeed after a short delay.
    setTimeout(() => applyStatus("ready"), 1500);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        switchWorkspace,
        createWorkspace,
        addAgent,
        addKnowledgeBase,
        retryFile,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success. (Provider not mounted anywhere yet — that's fine.)

- [ ] **Step 3: Commit**

```bash
git add src/components/workspaces/WorkspaceProvider.tsx
git commit -m "feat: WorkspaceProvider context with mock workspace state"
```

---

### Task 4: NewWorkspaceModal

**Files:**
- Create: `src/components/workspaces/NewWorkspaceModal.tsx`

**Interfaces:**
- Consumes: `useWorkspace()` (`createWorkspace`), `WORKSPACE_EMOJI_OPTIONS`, `WORKSPACE_COLOR_OPTIONS`, `useRouter` from `next/navigation`.
- Produces: `NewWorkspaceModal({ isOpen: boolean; onClose: () => void })` — creates the workspace via context, switches to it (context does this), navigates to `/workspaces`, and closes.

- [ ] **Step 1: Create the modal**

Styled after `NewKnowledgeBaseModal.tsx` (same overlay, panel, header, footer classes). Name required (button disabled when empty); emoji row; color swatch row.

```tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, Plus, LayoutGrid } from "lucide-react";
import { WORKSPACE_COLOR_OPTIONS, WORKSPACE_EMOJI_OPTIONS } from "@/types/workspaces";
import { useWorkspace } from "./WorkspaceProvider";

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewWorkspaceModal({ isOpen, onClose }: NewWorkspaceModalProps) {
  const { createWorkspace } = useWorkspace();
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(WORKSPACE_EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(WORKSPACE_COLOR_OPTIONS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createWorkspace({ name: name.trim(), emoji, color });
    setName("");
    setEmoji(WORKSPACE_EMOJI_OPTIONS[0]);
    setColor(WORKSPACE_COLOR_OPTIONS[0]);
    onClose();
    router.push("/workspaces");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[440px] rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222226] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
              <LayoutGrid className="h-4 w-4 text-[#85858e]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f5f5f5]">New Workspace</h2>
              <p className="text-xs text-[#85858e]">
                An isolated space with its own agents and shared knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85858e] transition-colors hover:bg-[#151519] hover:text-[#f5f5f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
              Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g., Marketing"
              className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 text-sm text-[#f5f5f5] outline-none placeholder:text-[#85858e] focus:border-[#5a5a5e]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
              Emoji
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WORKSPACE_EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors ${
                    e === emoji
                      ? "border-[#4ade80]/40 bg-[#4ade80]/10"
                      : "border-[#303036] bg-[#101010] hover:border-[#5a5a5e]"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
              Accent
            </label>
            <div className="flex gap-2">
              {WORKSPACE_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    c === color ? "scale-110 border-[#f5f5f5]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#222226] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#f5f5f5]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/workspaces/NewWorkspaceModal.tsx
git commit -m "feat: instant new-workspace modal (name, emoji, accent)"
```

---

### Task 5: WorkspaceAppShell, ShellGate, layout, and minimal home page

**Files:**
- Create: `src/components/workspaces/WorkspaceAppShell.tsx`
- Create: `src/components/workspaces/ShellGate.tsx`
- Modify: `src/app/layout.tsx` (swap `AppShell` for `ShellGate` — two lines)
- Create: `src/app/workspaces/layout.tsx`
- Create: `src/app/workspaces/page.tsx` (minimal version; Task 6 replaces it)

**Interfaces:**
- Consumes: `useWorkspace()`, `NewWorkspaceModal`, `AgentCreationModal` (existing signature — `onCreated` wired in Task 6), `usePathname`, `AppShell` (inside ShellGate only).
- Produces: `WorkspaceAppShell({ children })`; `ShellGate({ children })`; routes `/workspaces` rendering inside the new shell while `/` and `/shared-knowledge` keep the old shell.

- [ ] **Step 1: Create `src/components/workspaces/ShellGate.tsx`**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";

/**
 * Routes under /workspaces bring their own shell (WorkspaceAppShell via their
 * layout); everything else keeps the classic AppShell. Keeps existing pages
 * byte-identical while letting the prototype own its chrome.
 */
export function ShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/workspaces")) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 2: Swap it into `src/app/layout.tsx`**

Replace line 4:

```tsx
import { AppShell } from "@/components/AppShell";
```

with:

```tsx
import { ShellGate } from "@/components/workspaces/ShellGate";
```

and replace line 27:

```tsx
        <AppShell>{children}</AppShell>
```

with:

```tsx
        <ShellGate>{children}</ShellGate>
```

- [ ] **Step 3: Create `src/components/workspaces/WorkspaceAppShell.tsx`**

A sibling of `AppShell.tsx` (do not modify the original). Differences: workspace switcher replaces the logo row; nav points at `/workspaces` routes; Sessions renders the active workspace's agents; scoped regions animate on switch; header shows the workspace name.

```tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Plus,
  FolderOpen,
  Puzzle,
  Wrench,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Settings,
  Zap,
  Cpu,
  HardDrive,
  Check,
} from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { NewWorkspaceModal } from "./NewWorkspaceModal";
import { useWorkspace } from "./WorkspaceProvider";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Workspace", href: "/workspaces", icon: LayoutGrid },
  { id: "knowledge", label: "Shared Knowledge", href: "/workspaces/knowledge", icon: HardDrive },
  { id: "files", label: "Files", href: "#", icon: FolderOpen },
  { id: "integrations", label: "Integrations", href: "#", icon: Puzzle },
  { id: "skills", label: "Skills", href: "#", icon: Wrench },
  { id: "scheduled", label: "Scheduled", href: "#", icon: CalendarClock },
];

function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
        isActive
          ? "bg-[#1a1a1e] text-[#f5f5f5]"
          : "text-[#85858e] hover:bg-[#151519] hover:text-[#a7a7ad]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="wsSidebarActive"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#4ade80]"
        />
      )}
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative px-3 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#151519]"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#303036] text-base"
          style={{ backgroundColor: activeWorkspace.color + "18" }}
        >
          {activeWorkspace.emoji}
        </div>
        <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-[#f5f5f5]">
          {activeWorkspace.name}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#85858e] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-3 right-3 top-full z-30 rounded-xl border border-[#303036] bg-[#151519] p-1.5 shadow-2xl"
          >
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  switchWorkspace(ws.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#222226]"
              >
                <span className="text-base">{ws.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-[#f5f5f5]">{ws.name}</span>
                  <span className="block text-[10px] text-[#85858e]">
                    {ws.agents.length} agent{ws.agents.length !== 1 ? "s" : ""} ·{" "}
                    {ws.knowledgeBases.length} KB{ws.knowledgeBases.length !== 1 ? "s" : ""}
                  </span>
                </span>
                {ws.id === activeWorkspace.id && <Check className="h-3.5 w-3.5 text-[#4ade80]" />}
              </button>
            ))}
            <div className="my-1 border-t border-[#303036]" />
            <button
              onClick={() => {
                setOpen(false);
                setIsNewModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-[#85858e] transition-colors hover:bg-[#222226] hover:text-[#f5f5f5]"
            >
              <Plus className="h-3.5 w-3.5" />
              New workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <NewWorkspaceModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
    </div>
  );
}

function SessionItem({ name, status }: { name: string; status: "ready" | "busy" | "offline" }) {
  const statusColor =
    status === "ready" ? "bg-[#4ade80]" : status === "busy" ? "bg-[#f5c45e]" : "bg-[#85858e]";

  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#85858e] hover:bg-[#151519] hover:text-[#a7a7ad] cursor-pointer transition-colors">
      <div className={`h-2 w-2 rounded-full ${statusColor}`} />
      <span className="truncate">{name}</span>
    </div>
  );
}

export function WorkspaceAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeWorkspace, addAgent } = useWorkspace();
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#070708]">
      {/* Sidebar */}
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#222226] bg-[#0b0b0c]">
        <WorkspaceSwitcher />

        {/* New Agent */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setIsAgentModalOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-[#303036] bg-[#151519] px-3 py-2 text-[13px] text-[#f5f5f5] transition-colors hover:border-[#5a5a5e]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Agent
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.id} item={item} isActive={pathname === item.href} />
          ))}

          {/* Sessions (workspace-scoped) */}
          <div className="pt-4">
            <button
              onClick={() => setSessionsExpanded(!sessionsExpanded)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]"
            >
              Sessions
              {sessionsExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            <AnimatePresence mode="wait">
              {sessionsExpanded && (
                <motion.div
                  key={activeWorkspace.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  {activeWorkspace.agents.map((agent) => (
                    <SessionItem key={agent.id} name={agent.name} status={agent.status} />
                  ))}
                  {activeWorkspace.agents.length === 0 && (
                    <p className="px-3 py-2 text-[11px] text-[#85858e]">No agents yet</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Bottom (global — unchanged from classic shell) */}
        <div className="border-t border-[#222226] p-3 space-y-2">
          <button
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] text-[#85858e] hover:bg-[#151519] hover:text-[#a7a7ad] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced
            </div>
            {advancedExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          <div className="rounded-lg border border-[#222226] bg-[#101010] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#85858e]">Tokens today</span>
              <span className="text-[11px] text-[#f5f5f5] font-mono">0 / 1.5B</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#222226]">
              <div className="h-full w-[0%] rounded-full bg-[#4ade80]" />
            </div>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4ade80] px-3 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90">
            <Zap className="h-3.5 w-3.5" />
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-[#222226] bg-[#0b0b0c] px-6">
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-[#4ade80]" />
            <span className="text-sm font-medium text-[#f5f5f5]">
              {activeWorkspace.emoji} {activeWorkspace.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4ade80]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#4ade80]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              Ready
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-[#303036] border border-[#404046]" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkspace.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />
    </div>
  );
}
```

Note: `AgentCreationModal` gets its `onCreated` prop in Task 6; until then the sidebar "New Agent" flow is visual-only, matching the classic shell's behavior.

- [ ] **Step 4: Create `src/app/workspaces/layout.tsx`**

```tsx
import { WorkspaceProvider } from "@/components/workspaces/WorkspaceProvider";
import { WorkspaceAppShell } from "@/components/workspaces/WorkspaceAppShell";

export default function WorkspacesLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceAppShell>{children}</WorkspaceAppShell>
    </WorkspaceProvider>
  );
}
```

- [ ] **Step 5: Create minimal `src/app/workspaces/page.tsx`** (replaced wholesale in Task 6)

```tsx
"use client";

import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";

export default function WorkspaceHomePage() {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <h1 className="text-xl font-semibold text-[#f5f5f5]">
        {activeWorkspace.emoji} {activeWorkspace.name}
      </h1>
      <p className="text-sm text-[#85858e] mt-1">
        {activeWorkspace.agents.length} agents · {activeWorkspace.knowledgeBases.length} knowledge
        bases
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Verify build and behavior**

Run: `npm run build` — expected: success, `/workspaces` appears in the route list.
Then with `npm run dev`, check:
1. http://localhost:3000/workspaces shows the new shell: switcher reads "🟣 Marketing", Sessions lists Copywriter (green dot) and Brand Analyst (amber dot).
2. Click the switcher → dropdown lists Marketing ✓ and Tech with counts; pick Tech → header and sessions update with a fade; page shows Tech's counts.
3. Dropdown closes on Escape and on outside click.
4. "＋ New workspace" → modal; create "Design 🎨" → lands on `/workspaces` home of the empty Design workspace; switcher now lists three.
5. Regression: http://localhost:3000/ and /shared-knowledge still render the classic shell exactly as before.

- [ ] **Step 7: Commit**

```bash
git add src/components/workspaces/WorkspaceAppShell.tsx src/components/workspaces/ShellGate.tsx src/app/layout.tsx src/app/workspaces/layout.tsx src/app/workspaces/page.tsx
git commit -m "feat: workspace shell with dropdown switcher and /workspaces routes"
```

---

### Task 6: Workspace home page with agents/knowledge cards and empty states

**Files:**
- Modify: `src/components/AgentCreationModal.tsx` (additive `onCreated` prop only)
- Modify: `src/components/workspaces/WorkspaceAppShell.tsx` (pass `onCreated`)
- Rewrite: `src/app/workspaces/page.tsx` (replaces Task 5's minimal version)

**Interfaces:**
- Consumes: `useWorkspace()` (`activeWorkspace`, `addAgent`), `AgentCreationModal`.
- Produces: `AgentCreationModal` accepts optional `onCreated?: (agent: { name: string; role: string }) => void`, called on Create with the typed name (falling back to the selected specialty role). Home page links to `/workspaces/knowledge` and `/workspaces/knowledge?new=1` (Task 7 implements the `?new=1` behavior).

- [ ] **Step 1: Add `onCreated` to `AgentCreationModal`**

In `src/components/AgentCreationModal.tsx`, change the component signature (lines 140–146) to:

```tsx
export function AgentCreationModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (agent: { name: string; role: string }) => void;
}) {
```

and change `handleCreate` (lines 155–162) to:

```tsx
  const handleCreate = () => {
    const role = selectedAgent?.role ?? "Custom Agent";
    onCreated?.({ name: name.trim() || role, role });
    onClose();
    setStep(1);
    setSelectedSpecialty(null);
    setName("");
    setCategory("General");
    setFeatures({ desktop: true, memory: false });
  };
```

Existing callers pass no `onCreated`, so classic-shell behavior is unchanged.

- [ ] **Step 2: Wire it in `WorkspaceAppShell.tsx`**

Replace:

```tsx
      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />
```

with:

```tsx
      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onCreated={(agent) => addAgent(agent.name)}
      />
```

- [ ] **Step 3: Replace `src/app/workspaces/page.tsx` entirely with:**

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, HardDrive, Plus } from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { KnowledgeItem } from "@/types/skills";

function countFiles(items: KnowledgeItem[]): { total: number; pending: number } {
  let total = 0;
  let pending = 0;
  const walk = (list: KnowledgeItem[]) => {
    list.forEach((item) => {
      if (item.type === "file") {
        total++;
        if (item.status === "processing" || item.status === "queued" || item.status === "failed") {
          pending++;
        }
      }
      if (item.children) walk(item.children);
    });
  };
  walk(items);
  return { total, pending };
}

const STATUS_DOT: Record<string, string> = {
  ready: "bg-[#4ade80]",
  busy: "bg-[#f5c45e]",
  offline: "bg-[#85858e]",
};

export default function WorkspaceHomePage() {
  const { activeWorkspace, addAgent } = useWorkspace();
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  const fileStats = activeWorkspace.knowledgeBases
    .map((kb) => countFiles(kb.items))
    .reduce((acc, s) => ({ total: acc.total + s.total, pending: acc.pending + s.pending }), {
      total: 0,
      pending: 0,
    });

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#f5f5f5]">
          {activeWorkspace.emoji} {activeWorkspace.name}
        </h1>
        <p className="text-sm text-[#85858e] mt-1">
          An isolated workspace — its agents and shared knowledge live only here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agents card */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[#f5f5f5]">
              <Bot className="h-4 w-4 text-[#85858e]" />
              Agents
            </h2>
            <span className="text-[11px] text-[#85858e]">{activeWorkspace.agents.length}</span>
          </div>

          {activeWorkspace.agents.length > 0 ? (
            <div className="space-y-1">
              {activeWorkspace.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                >
                  <div className={`h-2 w-2 rounded-full ${STATUS_DOT[agent.status]}`} />
                  <span className="flex-1 truncate">{agent.name}</span>
                  <span className="text-[10px] uppercase tracking-wide text-[#85858e]">
                    {agent.status}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setIsAgentModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add agent
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#303036] px-4 py-8 text-center">
              <Bot className="mx-auto mb-2 h-5 w-5 text-[#85858e]" />
              <p className="text-sm text-[#85858e]">No agents in this workspace yet</p>
              <button
                onClick={() => setIsAgentModalOpen(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3.5 py-2 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add agent
              </button>
            </div>
          )}
        </div>

        {/* Knowledge card */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[#f5f5f5]">
              <HardDrive className="h-4 w-4 text-[#85858e]" />
              Shared Knowledge
            </h2>
            <span className="text-[11px] text-[#85858e]">
              {activeWorkspace.knowledgeBases.length}
            </span>
          </div>

          {activeWorkspace.knowledgeBases.length > 0 ? (
            <div className="space-y-1">
              {activeWorkspace.knowledgeBases.map((kb) => {
                const stats = countFiles(kb.items);
                return (
                  <Link
                    key={kb.id}
                    href="/workspaces/knowledge"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                  >
                    <span>{kb.emoji}</span>
                    <span className="flex-1 truncate">{kb.name}</span>
                    <span className="text-[10px] text-[#85858e]">
                      {stats.total} files{stats.pending > 0 && ` · ${stats.pending} pending`}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#85858e]" />
                  </Link>
                );
              })}
              <p className="mt-2 px-3 text-[11px] text-[#85858e]">
                {fileStats.total} files total
                {fileStats.pending > 0 && ` · ${fileStats.pending} still processing`}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#303036] px-4 py-8 text-center">
              <HardDrive className="mx-auto mb-2 h-5 w-5 text-[#85858e]" />
              <p className="text-sm text-[#85858e]">No shared knowledge yet</p>
              <Link
                href="/workspaces/knowledge?new=1"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3.5 py-2 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                New knowledge base
              </Link>
            </div>
          )}
        </div>
      </div>

      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onCreated={(agent) => addAgent(agent.name)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify build and behavior**

Run: `npm run build` — expected: success.
Then in the dev server:
1. `/workspaces` on Marketing shows both cards populated (2 agents; Brand Assets + Campaign Research with "3 pending" style counts).
2. "Add agent" opens the specialty modal; creating one appends it to the Agents card AND the sidebar Sessions list.
3. Switch to a freshly created empty workspace → both empty states render; "Add agent" works; "New knowledge base" navigates to `/workspaces/knowledge?new=1` (page 404s until Task 7 — that's expected at this point; just confirm the link's href).
4. Classic routes still regress clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/AgentCreationModal.tsx src/components/workspaces/WorkspaceAppShell.tsx src/app/workspaces/page.tsx
git commit -m "feat: workspace home with scoped agents/knowledge cards and empty states"
```

---

### Task 7: Workspace-scoped knowledge page with file-status chips

**Files:**
- Modify: `src/components/NewKnowledgeBaseModal.tsx` (additive `agents` prop only)
- Create: `src/app/workspaces/knowledge/page.tsx` (copy of `src/app/shared-knowledge/page.tsx`, then the exact edits below)

**Interfaces:**
- Consumes: `useWorkspace()` (`activeWorkspace`, `addKnowledgeBase`, `retryFile`), `NewKnowledgeBaseModal` (now with `agents` prop), `KnowledgeItem.status`.
- Produces: route `/workspaces/knowledge`; `NewKnowledgeBaseModal` accepts optional `agents?: string[]` (defaults to its internal `MOCK_AGENTS`, so the classic page is unchanged).

- [ ] **Step 1: Add the `agents` prop to `NewKnowledgeBaseModal`**

In `src/components/NewKnowledgeBaseModal.tsx`, change the props interface (lines 8–17) to:

```tsx
interface NewKnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    emoji: string;
    assignedAgents: string[];
  }) => void;
  /** Agent names offered for assignment. Defaults to the classic mock list. */
  agents?: string[];
}
```

Change the signature (line 21) to:

```tsx
export function NewKnowledgeBaseModal({ isOpen, onClose, onCreate, agents }: NewKnowledgeBaseModalProps) {
```

Immediately inside the component body add:

```tsx
  const agentOptions = agents ?? MOCK_AGENTS;
```

and in the Assign Agents section replace `{MOCK_AGENTS.map((agent) => {` with `{agentOptions.map((agent) => {`.

- [ ] **Step 2: Copy the classic page**

```bash
mkdir -p src/app/workspaces/knowledge
cp src/app/shared-knowledge/page.tsx src/app/workspaces/knowledge/page.tsx
```

- [ ] **Step 3: Apply the following edits to `src/app/workspaces/knowledge/page.tsx`** (the copy only — never the original)

**3a — imports.** Replace:

```tsx
import React, { useMemo, useState } from "react";
```

with:

```tsx
import React, { useEffect, useMemo, useState } from "react";
```

In the lucide-react import block, add these names to the list: `Check`, `Loader2`, `Clock`, `AlertTriangle`, `RotateCw`.

Replace:

```tsx
import { MOCK_SHARED_KNOWLEDGE } from "@/data/mock-shared-knowledge";
import { KnowledgeItem, SharedKnowledge } from "@/types/skills";
import { NewKnowledgeBaseModal } from "@/components/NewKnowledgeBaseModal";
```

with:

```tsx
import { KnowledgeItem } from "@/types/skills";
import { NewKnowledgeBaseModal } from "@/components/NewKnowledgeBaseModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
```

**3b — StatusChip component.** Insert immediately after the imports (before `KnowledgeTree`):

```tsx
function StatusChip({
  status,
  onRetry,
}: {
  status?: KnowledgeItem["status"];
  onRetry?: () => void;
}) {
  if (!status || status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#4ade80]/10 px-1.5 py-0.5 text-[10px] text-[#4ade80]">
        <Check className="h-2.5 w-2.5" />
        ready
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5c45e]/10 px-1.5 py-0.5 text-[10px] text-[#f5c45e]">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        processing
      </span>
    );
  }
  if (status === "queued") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#151519] px-1.5 py-0.5 text-[10px] text-[#85858e]">
        <Clock className="h-2.5 w-2.5" />
        queued
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#ef4444]/10 px-1.5 py-0.5 text-[10px] text-[#ef4444]">
      <AlertTriangle className="h-2.5 w-2.5" />
      failed
      {onRetry && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          title="Retry conversion"
          className="ml-0.5 hover:text-[#f5f5f5] transition-colors"
        >
          <RotateCw className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}
```

**3c — KnowledgeTree: thread retry + render chip.** Change the `KnowledgeTree` signature to:

```tsx
function KnowledgeTree({
  item,
  depth = 0,
  onPreview,
  onRetry,
}: {
  item: KnowledgeItem;
  depth?: number;
  onPreview?: (item: KnowledgeItem) => void;
  onRetry?: (fileId: string) => void;
}) {
```

After the name span (`<span className="text-[13px] text-[#f5f5f5] min-w-0 flex-1 truncate">{item.name}</span>`), insert:

```tsx
        {!isFolder && (
          <StatusChip status={item.status} onRetry={() => onRetry?.(item.id)} />
        )}
```

And in the recursive call, pass it through — replace:

```tsx
              <KnowledgeTree key={child.id} item={child} depth={depth + 1} onPreview={onPreview} />
```

with:

```tsx
              <KnowledgeTree
                key={child.id}
                item={child}
                depth={depth + 1}
                onPreview={onPreview}
                onRetry={onRetry}
              />
```

**3d — KnowledgeCard: status summary + retry threading.** Change the signature to:

```tsx
function KnowledgeCard({
  knowledge,
  onPreview,
  onRetry,
}: {
  knowledge: SharedKnowledge;
  onPreview?: (item: KnowledgeItem) => void;
  onRetry?: (knowledgeBaseId: string, fileId: string) => void;
}) {
```

`SharedKnowledge` is no longer imported per 3a — change the type import line from `import { KnowledgeItem } from "@/types/skills";` to `import { KnowledgeItem, SharedKnowledge } from "@/types/skills";` (keep it).

After the `folderCount` memo, add:

```tsx
  const pendingCount = useMemo(() => {
    let count = 0;
    const walk = (items: KnowledgeItem[]) => {
      items.forEach((item) => {
        if (
          item.type === "file" &&
          (item.status === "processing" || item.status === "queued" || item.status === "failed")
        ) {
          count++;
        }
        if (item.children) walk(item.children);
      });
    };
    walk(knowledge.items);
    return count;
  }, [knowledge.items]);
```

In the card header stats, replace:

```tsx
            <HardDrive className="h-3 w-3" />
            {fileCount} files
            {folderCount > 0 && `, ${folderCount} folders`}
```

with:

```tsx
            <HardDrive className="h-3 w-3" />
            {fileCount} files
            {folderCount > 0 && `, ${folderCount} folders`}
            {pendingCount > 0 && (
              <span className="text-[#f5c45e]"> · {pendingCount} pending</span>
            )}
```

And in the expanded contents, replace:

```tsx
                {knowledge.items.map((item) => (
                  <KnowledgeTree key={item.id} item={item} onPreview={onPreview} />
                ))}
```

with:

```tsx
                {knowledge.items.map((item) => (
                  <KnowledgeTree
                    key={item.id}
                    item={item}
                    onPreview={onPreview}
                    onRetry={(fileId) => onRetry?.(knowledge.id, fileId)}
                  />
                ))}
```

**3e — page component: context, scope chip, ?new=1.** Replace the whole `export default function SharedKnowledgePage() {` opening block:

```tsx
export default function SharedKnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState(MOCK_SHARED_KNOWLEDGE);
```

with:

```tsx
export default function WorkspaceKnowledgePage() {
  const { activeWorkspace, addKnowledgeBase, retryFile } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const knowledgeBases = activeWorkspace.knowledgeBases;

  // Deep link: /workspaces/knowledge?new=1 opens the creation modal on mount.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setIsNewModalOpen(true);
    }
  }, []);
```

In the header, replace:

```tsx
            <h1 className="text-xl font-semibold text-[#f5f5f5]">Shared Knowledge</h1>
```

with:

```tsx
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#f5f5f5]">Shared Knowledge</h1>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-[#303036] px-2.5 py-0.5 text-[11px] text-[#a7a7ad]"
                style={{ backgroundColor: activeWorkspace.color + "14" }}
              >
                {activeWorkspace.emoji} {activeWorkspace.name}
              </span>
            </div>
```

In the grid, replace:

```tsx
          <KnowledgeCard
            key={knowledge.id}
            knowledge={knowledge}
            onPreview={setPreviewItem}
          />
```

with:

```tsx
          <KnowledgeCard
            key={knowledge.id}
            knowledge={knowledge}
            onPreview={setPreviewItem}
            onRetry={retryFile}
          />
```

And replace the `NewKnowledgeBaseModal` usage at the bottom:

```tsx
          <NewKnowledgeBaseModal
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            onCreate={(data) => {
              const newBase: SharedKnowledge = {
                id: `kb-${Date.now()}`,
                ...data,
                items: [],
              };
              setKnowledgeBases((prev) => [newBase, ...prev]);
            }}
          />
```

with:

```tsx
          <NewKnowledgeBaseModal
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            agents={activeWorkspace.agents.map((a) => a.name)}
            onCreate={addKnowledgeBase}
          />
```

The empty-state block ("No knowledge bases match your search.") stays as-is — it also covers the brand-new-workspace case when there are zero KBs.

- [ ] **Step 4: Verify build and behavior**

Run: `npm run build` — expected: success, `/workspaces/knowledge` in route list. Confirm the classic page still compiles untouched: `git diff --stat src/app/shared-knowledge/` shows nothing.
Then in the dev server:
1. `/workspaces/knowledge` on Marketing shows Brand Assets + Campaign Research with the 🟣 Marketing scope chip; Campaign Research header shows "· 3 pending" in amber.
2. Expand Campaign Research: Competitor Analysis.pdf shows an animated "processing" chip; Launch Brief.docx (inside Q3 Briefs) shows "queued"; Focus Group Notes.docx shows red "failed" with a retry icon.
3. Click retry on the failed file → chip flips to "processing" (spinner), then "ready" after ~1.5s; the pending count drops.
4. Switch workspace to Tech via the sidebar → the page now lists API Documentation + Runbooks, chip reads 🔵 Tech, and "Assign Agents" in the new-KB modal lists Product Owner / Code Reviewer / SRE Agent (not the classic claw-1/claw-2 list).
5. Create a KB via "＋ New Knowledge Base" → appears at the top; navigate to `/workspaces` and back → it's still there (state lives in the provider, not the page).
6. Visit `/workspaces/knowledge?new=1` directly → creation modal is open on load.
7. Classic `/shared-knowledge` still shows its original four KBs, no chips, claw-* agent list.

- [ ] **Step 5: Commit**

```bash
git add src/components/NewKnowledgeBaseModal.tsx src/app/workspaces/knowledge/page.tsx
git commit -m "feat: workspace-scoped knowledge page with file conversion status chips"
```

---

### Task 8: Full-flow verification pass

**Files:** none — verification only.

**Interfaces:**
- Consumes: everything above.
- Produces: a verified, demoable prototype and a clean final build.

- [ ] **Step 1: Run the six spec test flows end-to-end against the dev server**

1. Load `/workspaces` → defaults to Marketing; sidebar Sessions and home cards match Marketing mocks.
2. Switch to Tech → agents, knowledge, header, and scope chip all change with the fade transition.
3. Create workspace "Design 🎨" → lands on empty home; both empty states present; "Add agent" appends to sidebar + card; "New knowledge base" deep-links with the modal open; create a KB and confirm it appears.
4. Knowledge page: statuses render; failed → retry → processing → ready works; per-KB pending counts correct.
5. Regression: `/`, `/shared-knowledge`, `/skill/[id]` (pick one from the home grid), `/agent/product-owner` all render identically to the Task 1 baseline.
6. Refresh `/workspaces` → state resets to the two mock workspaces (expected — in-memory only).

- [ ] **Step 2: Final build + lint**

Run: `npm run build && npm run lint`
Expected: both succeed. Fix any lint complaints in **new** files only; do not touch pre-existing lint state.

- [ ] **Step 3: Commit any verification fixes**

```bash
git add -A && git commit -m "fix: polish from full-flow verification pass" # only if fixes were needed
```

---

## Self-Review Notes

- **Spec coverage:** switcher (Task 5), instant creation + landing (Tasks 4–5), scoped home + empty states (Task 6), scoped knowledge + status chips + retry + `?new=1` (Task 7), transitions (Task 5 `AnimatePresence`), additive-only shared-file changes (Tasks 2, 6, 7), untouched classic routes verified in every task. One deviation from spec, agreed rationale: spec didn't know the root layout hard-wires `AppShell`; `ShellGate` (Task 5) is the minimal non-behavioral fix.
- **Type consistency:** `useWorkspace()` surface defined once in Task 3 and consumed by name everywhere; `KnowledgeItem["status"]` union used consistently; `onRetry(knowledgeBaseId, fileId)` matches `retryFile(knowledgeBaseId, fileId)`.
- **Known accepted trade-offs:** knowledge page duplication (per spec), in-memory state, `layoutId` differs between shells (`wsSidebarActive`) to avoid framer-motion cross-shell collisions.
