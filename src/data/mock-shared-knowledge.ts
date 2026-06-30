import { SharedKnowledge } from "@/types/skills";

export const MOCK_SHARED_KNOWLEDGE: SharedKnowledge[] = [
  {
    id: "product-docs",
    name: "Product Documentation",
    description: "Shared product specs, roadmaps, and feature documentation",
    emoji: "📚",
    items: [
      {
        id: "prd-2026",
        name: "PRD - Agent Workspaces",
        type: "file",
        size: "245 KB",
        modified: "2026-06-28",
      },
      {
        id: "roadmap",
        name: "Q3 2026 Roadmap",
        type: "file",
        size: "128 KB",
        modified: "2026-06-25",
      },
      {
        id: "features",
        name: "Feature Specifications",
        type: "folder",
        modified: "2026-06-20",
        children: [
          { id: "f1", name: "Skill Creation Flow.md", type: "file", size: "45 KB", modified: "2026-06-20" },
          { id: "f2", name: "Shared Knowledge UI.md", type: "file", size: "38 KB", modified: "2026-06-18" },
        ],
      },
    ],
    assignedAgents: ["claw-1", "claw-2"],
  },
  {
    id: "brand-assets",
    name: "Brand Assets",
    description: "Logos, color palettes, typography, and brand guidelines",
    emoji: "🎨",
    items: [
      { id: "logo", name: "hyperclaw-logo.svg", type: "file", size: "12 KB", modified: "2026-05-15" },
      { id: "colors", name: "Color Palette.md", type: "file", size: "8 KB", modified: "2026-05-15" },
      { id: "typography", name: "Typography.md", type: "file", size: "15 KB", modified: "2026-05-20" },
    ],
    assignedAgents: ["claw-1"],
  },
  {
    id: "api-docs",
    name: "API Documentation",
    description: "Internal API references, endpoints, and integration guides",
    emoji: "🔌",
    items: [
      { id: "openapi", name: "openapi.yaml", type: "file", size: "156 KB", modified: "2026-06-22" },
      { id: "guides", name: "Integration Guides", type: "folder", modified: "2026-06-15", children: [
        { id: "g1", name: "Authentication.md", type: "file", size: "22 KB", modified: "2026-06-15" },
        { id: "g2", name: "Rate Limits.md", type: "file", size: "18 KB", modified: "2026-06-14" },
      ]},
      { id: "postman", name: "HyperCLI.postman_collection.json", type: "file", size: "89 KB", modified: "2026-06-10" },
    ],
    assignedAgents: ["claw-2", "claw-3"],
  },
  {
    id: "runbooks",
    name: "Runbooks",
    description: "Operational procedures, incident response, and troubleshooting",
    emoji: "📋",
    items: [
      { id: "incident", name: "Incident Response.md", type: "file", size: "67 KB", modified: "2026-06-01" },
      { id: "deploy", name: "Deployment Procedures.md", type: "file", size: "54 KB", modified: "2026-05-28" },
      { id: "troubleshoot", name: "Troubleshooting Guide.md", type: "file", size: "92 KB", modified: "2026-06-05" },
    ],
    assignedAgents: ["claw-1", "claw-2", "claw-3"],
  },
];
