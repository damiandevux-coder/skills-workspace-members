export interface WorkspaceSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji?: string;
  homepage?: string;
  requiresEnv: string[];
  requiresBins: string[];
  os: string[];
  installHints: string[];
  disabled?: boolean;
  hasScripts: boolean;
  hasReferences: boolean;
  hasAssets: boolean;
}

export interface SkillFormData {
  name: string;
  description: string;
  emoji: string;
  homepage: string;
  userInvocable: boolean;
  disableModelInvocation: boolean;
  instructions: string;
  requiresBins: string[];
  requiresEnv: string[];
  os: string[];
}

export const SKILL_CATEGORIES = [
  "Platform",
  "Media",
  "System",
  "Productivity",
  "Hardware",
  "Lookups",
  "Authoring",
  "General",
] as const;

export const EMOJI_OPTIONS = [
  "🔧", "⚙️", "📊", "💬", "🐙", "☔", "🧭", "🔍", "📁", "🎨",
  "🎵", "🎬", "📷", "🔐", "🌐", "📡", "⚡", "🛠️", "📋", "🤖",
];

export const OS_OPTIONS = [
  { value: "darwin", label: "macOS" },
  { value: "linux", label: "Linux" },
  { value: "win32", label: "Windows" },
];
