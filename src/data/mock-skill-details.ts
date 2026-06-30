import { SkillDetail } from "@/types/skills";

export const MOCK_SKILL_DETAILS: Record<string, SkillDetail> = {
  github: {
    id: "github",
    name: "GitHub",
    description: "GitHub CLI for issues, PRs, CI/check logs, comments, reviews, releases, repos, and gh api queries.",
    category: "Platform",
    emoji: "🐙",
    requiresEnv: ["GITHUB_TOKEN"],
    requiresBins: ["gh"],
    os: [],
    installHints: ["Install GitHub CLI: https://cli.github.com/"],
    disabled: false,
    hasScripts: false,
    hasReferences: false,
    hasAssets: false,
    overview: `# GitHub

GitHub CLI skill for managing repositories, issues, pull requests, and more.

## When to Use

- When asked about GitHub repositories, issues, or PRs
- When checking CI/CD status or build logs
- When managing releases or deployments
- When querying GitHub API for repository data

## Tools Available

- **Issues**: Create, list, update, close issues
- **Pull Requests**: Review, merge, comment on PRs
- **CI/Checks**: Monitor build status and logs
- **Releases**: Create and manage releases
- **Repos**: Query repository information

## Authentication

Requires a GitHub Personal Access Token with appropriate scopes.

## Examples

\`\`\`bash
# List open issues
gh issue list --repo owner/repo --state open

# Check PR status
gh pr view 123 --repo owner/repo

# View CI logs
gh run view --repo owner/repo
\`\`\``,
    files: [
      { name: "SKILL.md", type: "skill", size: "2.4 KB" },
    ],
    relatedSkills: ["gh-issues", "slack"],
  },
  "diagram-maker": {
    id: "diagram-maker",
    name: "Diagram Maker",
    description: "Create SVG/HTML or Excalidraw diagrams for concepts, architecture, flows, and whiteboards.",
    category: "Authoring",
    emoji: "🧭",
    requiresEnv: [],
    requiresBins: [],
    os: [],
    installHints: [],
    disabled: false,
    hasScripts: false,
    hasReferences: true,
    hasAssets: false,
    overview: `# Diagram Maker

Create beautiful diagrams for architecture, flows, and whiteboards.

## When to Use

- When explaining system architecture
- When documenting workflows or processes
- When creating whiteboard-style sketches
- When visualizing data flows or relationships

## Output Formats

- **SVG**: Scalable vector graphics
- **HTML**: Interactive diagrams
- **Excalidraw**: Hand-drawn style sketches

## References

The skill includes reference files with patterns and templates for common diagram types.

## Examples

\`\`\`
Create an Excalidraw diagram showing a microservices architecture
with API Gateway, Auth Service, and three microservices.
\`\`\``,
    files: [
      { name: "SKILL.md", type: "skill", size: "1.8 KB" },
      { name: "references/excalidraw-patterns.md", type: "reference", size: "4.2 KB" },
      { name: "references/svg-template.md", type: "reference", size: "3.1 KB" },
    ],
    relatedSkills: ["taskflow", "canvas"],
  },
  "skill-creator": {
    id: "skill-creator",
    name: "Skill Creator",
    description: "Create, edit, audit, tidy, validate, or restructure AgentSkills and SKILL.md files.",
    category: "Authoring",
    emoji: "🔧",
    requiresEnv: [],
    requiresBins: [],
    os: [],
    installHints: [],
    disabled: true,
    hasScripts: true,
    hasReferences: false,
    hasAssets: false,
    overview: `# Skill Creator

Create, edit, audit, tidy, validate, or restructure AgentSkills and SKILL.md files.

## When to Use

- When creating a new skill for an agent
- When auditing existing skills for quality
- When restructuring skill directories
- When validating SKILL.md syntax

## Scripts

- **quick_validate.py**: Fast validation of SKILL.md structure
- **package_skill.py**: Package a skill for distribution
- **init_skill.py**: Initialize a new skill directory

## Examples

\`\`\`bash
# Validate a skill
python scripts/quick_validate.py /path/to/skill

# Package for distribution
python scripts/package_skill.py /path/to/skill
\`\`\``,
    files: [
      { name: "SKILL.md", type: "skill", size: "2.1 KB" },
      { name: "scripts/quick_validate.py", type: "script", size: "3.4 KB" },
      { name: "scripts/package_skill.py", type: "script", size: "2.8 KB" },
      { name: "scripts/init_skill.py", type: "script", size: "1.9 KB" },
      { name: "scripts/test_quick_validate.py", type: "script", size: "2.2 KB" },
      { name: "license.txt", type: "asset", size: "1.1 KB" },
    ],
    relatedSkills: ["diagram-maker", "taskflow"],
  },
  slack: {
    id: "slack",
    name: "Slack",
    description: "Slack tool actions: send/read/edit/delete messages, react, pin/unpin, list pins/reactions/emoji, member info.",
    category: "Platform",
    emoji: "💬",
    requiresEnv: ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"],
    requiresBins: [],
    os: [],
    installHints: ["Create a Slack app at https://api.slack.com/apps"],
    disabled: false,
    hasScripts: false,
    hasReferences: false,
    hasAssets: false,
    overview: `# Slack

Slack tool actions for messaging, reactions, and channel management.

## When to Use

- When asked to send a Slack message
- When checking mentions or notifications
- When managing channels or reactions
- When querying member information

## Actions

- **Messages**: Send, read, edit, delete
- **Reactions**: Add, remove, list
- **Pins**: Pin/unpin messages
- **Members**: Get member info and status

## Authentication

Requires a Slack Bot Token with appropriate scopes.

## Examples

\`\`\`
Send a message to #general: "Meeting in 5 minutes"
Get all pinned messages in #announcements
List reactions to the last message in #general
\`\`\``,
    files: [
      { name: "SKILL.md", type: "skill", size: "2.0 KB" },
    ],
    relatedSkills: ["telegram", "discord"],
  },
  weather: {
    id: "weather",
    name: "Weather",
    description: "Current weather and forecasts with wttr.in via curl for locations, rain, temperature, travel planning.",
    category: "Lookups",
    emoji: "☔",
    requiresEnv: [],
    requiresBins: ["curl"],
    os: [],
    installHints: [],
    disabled: false,
    hasScripts: false,
    hasReferences: false,
    hasAssets: false,
    overview: `# Weather

Current weather and forecasts using wttr.in.

## When to Use

- When asked about weather conditions
- When planning travel or outdoor activities
- When checking rain forecasts
- When comparing temperatures across locations

## Features

- Current conditions
- Multi-day forecasts
- Location-based queries
- Temperature, rain, wind data

## Examples

\`\`\`bash
# Current weather in London
curl wttr.in/London

# Weather forecast for New York
curl wttr.in/New\ York?format=3
\`\`\``,
    files: [
      { name: "SKILL.md", type: "skill", size: "1.2 KB" },
    ],
    relatedSkills: ["gemini"],
  },
  healthcheck: {
    id: "healthcheck",
    name: "Healthcheck",
    description: "Audit/harden OpenClaw hosts: SSH, firewall, updates, exposure, backups, disk encryption, gateway security.",
    category: "System",
    emoji: "🔍",
    requiresEnv: [],
    requiresBins: [],
    os: ["linux"],
    installHints: [],
    disabled: false,
    hasScripts: false,
    hasReferences: false,
    hasAssets: false,
    overview: `# Healthcheck

Audit and harden OpenClaw hosts.

## When to Use

- When setting up a new host
- During security audits
- When checking system health
- Before production deployments

## Checks

- SSH configuration
- Firewall rules
- System updates
- Network exposure
- Disk encryption
- Gateway security
- Backup status

## OS Support

Primarily designed for Linux hosts.

## Examples

\`\`\`
Run a full security audit on the current host
Check if SSH is configured securely
Verify firewall is active and configured
\`\`\``,
    files: [
      { name: "SKILL.md", type: "skill", size: "2.3 KB" },
    ],
    relatedSkills: ["taskflow"],
  },
};
