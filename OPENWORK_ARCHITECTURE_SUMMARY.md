# OpenWork Architecture Summary — Hotel Copilot Adaptation Guide

> Generated from deep exploration of [different-ai/openwork](https://github.com/different-ai/openwork) (v0.11.138) and the local vescript repo.

---

## 1. OpenWork Monorepo Structure

```
different-ai/openwork/
├── packages/
│   ├── app/              # @different-ai/openwork-ui  — SolidJS frontend (Vite)
│   ├── desktop/          # @different-ai/openwork     — Tauri v2 desktop shell (Rust)
│   ├── server/           # openwork-server            — Bun HTTP API server
│   ├── orchestrator/     # openwork-orchestrator      — CLI host that spawns opencode + server + router
│   ├── opencode-router/  # opencode-router            — Slack + Telegram bridge
│   ├── web/              # @different-ai/openwork-web — Next.js web frontend (minimal)
│   ├── landing/          # @different-ai/openwork-landing — Marketing site (Next.js)
│   ├── docs/             # Documentation (currently minimal)
│   └── openwork/         # (empty placeholder)
├── services/
│   ├── den/              # Cloud worker management
│   ├── den-worker-runtime/
│   └── openwork-share/   # Vercel-deployed share service
├── packaging/
│   ├── aur/              # Arch Linux AUR package
│   └── docker/           # Docker packaging
├── scripts/              # Build, release, dev scripts
├── patches/              # pnpm patch overrides
├── .opencode/            # Project-level skills, commands, agents
│   ├── skills/           # 13 skills for OpenWork development itself
│   ├── commands/         # 3 slash commands (release, hello-stranger, browser-setup)
│   └── agent/            # 4 agent definitions (css, triage, docs, duplicate-pr)
├── ARCHITECTURE.md       # Core design principles
├── PRINCIPLES.md         # Decision framework
├── PRODUCT.md            # Target users (Bob the IT guy, Susan in accounting)
├── VISION.md
└── opencode.json         # Root config (just $schema ref)
```

### Package Dependency Graph

```
                    ┌─────────────────────┐
                    │    packages/app      │
                    │  (SolidJS Frontend)  │
                    └──────────┬──────────┘
                               │ consumed by
                    ┌──────────▼──────────┐
                    │  packages/desktop   │
                    │   (Tauri v2 Shell)  │
                    │   frontendDist →    │
                    │   ../../app/dist    │
                    └──────────┬──────────┘
                               │ spawns sidecars
           ┌───────────────────┼───────────────────┐
           │                   │                   │
┌──────────▼──────────┐ ┌──────▼──────┐ ┌─────────▼─────────┐
│  packages/server    │ │  opencode   │ │ opencode-router   │
│ (Bun HTTP API)      │ │ (sidecar)   │ │ (Slack/Telegram)  │
└─────────────────────┘ └─────────────┘ └───────────────────┘
           │                   ▲
           │   proxies to      │
           └───────────────────┘

packages/orchestrator  ← CLI alternative to desktop (spawns same stack)
```

**Key relationships:**
- `desktop` bundles `app/dist` as its webview frontend
- `desktop` ships `opencode`, `openwork-server`, `opencode-router`, and `openwork-orchestrator` as Tauri **sidecars** (external binaries)
- `server` proxies OpenCode API calls and manages skills/plugins/MCP/commands via filesystem
- `orchestrator` is a headless alternative to `desktop` — spawns the same services via CLI
- `opencode-router` bridges Slack/Telegram messages to OpenCode sessions

---

## 2. Skill Loading Mechanism

### Skill File Format

Skills live at `.opencode/skills/<name>/SKILL.md` where `<name>` matches a strict pattern:

```
^[a-z0-9]+(-[a-z0-9]+)*$    (1-64 chars)
```

Each `SKILL.md` has **YAML frontmatter** + **Markdown body**:

```markdown
---
name: hotel-revenue-manager
description: Rate review, pricing strategy, revenue analysis including ADR, RevPAR, comp set benchmarking.
trigger: User asks about rate review or pricing  # optional
---

## When to use

- The user asks about rate review, pricing...

## What to do

1. Load property rate data...
2. Pull comp set data...

## Context

- Data sources referenced...

## Output format

Structured output template...
```

### Discovery Algorithm (`packages/server/src/skills.ts`)

1. **Walk up from workspace root** to git worktree root
2. At each directory, scan:
   - `.opencode/skills/*/SKILL.md` (flat layout)
   - `.opencode/skills/<domain>/*/SKILL.md` (domain/category layout — one level deep)
   - `.claude/skills/*/SKILL.md` (Claude-compatible alias)
3. **Global skills** (when `includeGlobal=true`):
   - `~/.config/opencode/skills/`
   - `~/.claude/skills/`
   - `~/.agents/skills/`
   - `~/.agent/skills/`
4. Deduplicate by name (first-seen wins — project beats global)

### Frontmatter parsing

- `name`: must match directory name
- `description`: 1-1024 chars, validated
- `trigger` / `when`: auto-detected from frontmatter or from `## When to use` body section

### Skill CRUD (via OpenWork Server API)

| Operation | Endpoint | Auth |
|-----------|----------|------|
| List | `GET /workspace/:id/skills` | client |
| Read | `GET /workspace/:id/skills/:name` | client |
| Create/Update | `POST /workspace/:id/skills` | client |
| Delete | `DELETE /workspace/:id/skills/:name` | client |
| Hub Browse | `GET /hub/skills` | client |
| Hub Install | `POST /workspace/:id/skills/hub/:name` | client |

### Skill Hub (`packages/server/src/skill-hub.ts`)

- Fetches skill catalog from `github.com/different-ai/openwork-hub` (configurable repo)
- 5-minute TTL cache
- `installHubSkill()` downloads entire skill directory tree (including scripts, .gitignore, etc.)
- Validates that `SKILL.md` exists after install

### Hot Reload

`packages/server/src/reload-watcher.ts` uses `fs.watch()` on:
- `.opencode/skills/`
- `.opencode/commands/`
- `.opencode/plugins/`
- `.opencode/agents/`
- Root config files (`opencode.json`, `AGENTS.md`)

Changes trigger debounced reload events → the desktop app can call `POST /workspace/:id/engine/reload` which dispatches `POST /instance/dispose` to OpenCode.

---

## 3. MCP Tool Registration

### Configuration (`packages/server/src/mcp.ts`)

MCPs are defined in `opencode.json` (or `opencode.jsonc`) under the `mcp` key:

```jsonc
{
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["node", "path/to/server.js"]
    },
    "hotel-pms": {
      "type": "remote",
      "url": "https://pms-mcp.example.com/mcp"
    }
  }
}
```

### Resolution order

1. **Global config**: `~/.config/opencode/opencode.json`
2. **Project config**: `<workspace>/opencode.json`
3. Project-level entries override global entries with the same name

### Disable mechanism

MCPs can be disabled via `tools.deny` glob patterns:
```jsonc
{ "tools": { "deny": ["mcp.chrome-devtools.*"] } }
```

### API surface

| Operation | Endpoint |
|-----------|----------|
| List | `GET /workspace/:id/mcp` |
| Add | `POST /workspace/:id/mcp` |
| Remove | `DELETE /workspace/:id/mcp/:name` |
| Remove Auth | `DELETE /workspace/:id/mcp/:name/auth` |

---

## 4. Commands (Slash Commands)

### File format

Commands live at `.opencode/commands/<name>.md`:

```markdown
---
description: Generate a morning briefing for the current property
agent: default        # optional: which agent handles this
model: null           # optional: override model
subtask: false        # optional: run as subtask
---

You are preparing the General Manager's morning briefing. Use the **hotel-gm-briefing** skill.

Arguments: `$ARGUMENTS`
- If empty, generate the briefing for today's date at the default property.

Do the following:
1. Load last night's night audit data...
```

### Key features

- `$ARGUMENTS` is a template variable replaced at runtime
- Commands can reference skills by name
- Commands can specify `agent` and `model` overrides
- CRUD via `/workspace/:id/commands` API

---

## 5. Plugin System

### Two sources

1. **Config plugins**: Listed in `opencode.json` → `plugin` array (npm packages or `file://` paths)
2. **Directory plugins**: `.js`/`.ts` files in `.opencode/plugins/` (project) or `~/.config/opencode/plugins/` (global)

### Load order

`config.global` → `config.project` → `dir.global` → `dir.project`

---

## 6. Desktop App Build Process

### Stack: Tauri v2 (Rust) + SolidJS

```
packages/desktop/
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs          # Main app setup, Tauri commands
│   │   ├── config.rs       # OpenCode config read/write
│   │   ├── engine/         # OpenCode engine lifecycle
│   │   ├── orchestrator/   # Orchestrator subprocess management
│   │   ├── openwork_server/ # Server subprocess management
│   │   ├── opencode_router/ # Router subprocess management
│   │   ├── workspace/      # Workspace file watching
│   │   ├── opkg.rs         # Skill package installer
│   │   └── commands/       # 50+ Tauri IPC commands
│   ├── tauri.conf.json     # App config, sidecar binaries
│   └── Cargo.toml
├── scripts/
│   └── prepare-sidecar.mjs # Downloads/builds sidecar binaries
└── package.json
```

### Build steps

1. `pnpm -C ../.. --filter @different-ai/openwork run prepare:sidecar` — downloads/builds:
   - `opencode` binary
   - `openwork-server` binary
   - `opencode-router` binary
   - `openwork-orchestrator` binary
   - `chrome-devtools-mcp` binary
2. `pnpm -w build:ui` — builds the SolidJS frontend to `packages/app/dist/`
3. `tauri build` — compiles the Rust shell, bundles frontend + sidecars

### Tauri commands (IPC)

The desktop app exposes ~50 IPC commands from Rust:
- Engine: `engine_start`, `engine_stop`, `engine_restart`, `engine_doctor`, `engine_install`
- Orchestrator: `orchestrator_status`, `orchestrator_workspace_activate`, `orchestrator_start_detached`
- Server: `openwork_server_info`, `openwork_server_restart`
- Router: `opencodeRouter_info`, `opencodeRouter_start/stop/status`
- Workspace: `workspace_bootstrap`, `workspace_create`, `workspace_set_active`
- Skills: `list_local_skills`, `read_local_skill`, `write_local_skill`, `uninstall_skill`, `install_skill_template`
- Config: `read_opencode_config`, `write_opencode_config`
- Scheduler: `scheduler_list_jobs`, `scheduler_delete_job`

### Runtime modes

1. **Host (Desktop)**: Launches OpenCode server + sidecars locally
2. **Client (Mobile)**: Connects to existing server via QR/token
3. **Cloud**: Connects to hosted OpenWork Cloud workers

---

## 7. Orchestrator Architecture

`packages/orchestrator/src/cli.ts` is a ~3000-line CLI that:

1. Resolves sidecar binaries (bundled → downloaded → external PATH)
2. Spawns child processes:
   - **OpenCode** server on port 4096 (configurable)
   - **OpenWork Server** on port 8787 (configurable)
   - **OpenCode Router** (optional, for Slack/Telegram)
3. Manages workspace state in `~/.openwork/` (or `OPENWORK_DATA_DIR`)
4. Supports Docker/container sandbox mode
5. Hot-reloads OpenCode when `.opencode/` files change
6. Exposes a TUI (terminal UI) via `packages/orchestrator/src/tui/app.tsx`

---

## 8. Scheduled Tasks / Automations

### Two scheduling systems

#### 8a. OS-level Scheduler (`packages/server/src/scheduler.ts`)

- **macOS**: LaunchAgent plist files in `~/Library/LaunchAgents/`
- **Linux**: systemd user services/timers in `~/.config/systemd/user/`
- Job definitions stored as JSON in `~/.config/opencode/scheduler/scopes/<scopeId>/jobs/`
- Each job specifies: `slug`, `name`, `schedule` (cron-like), `prompt`, `workdir`, optional `run` config

#### 8b. AgentLab Automations (`server.ts` routes)

- Workspace-scoped automations stored in `.opencode/openwork/agentlab/automations.json`
- Schedule types: `interval` (seconds), `daily` (hour:minute), `weekly` (day+time)
- Routes: `GET/POST/DELETE /workspace/:id/agentlab/automations`
- Manual trigger: `POST /workspace/:id/agentlab/automations/:id/run`
- Logs stored per-automation in `.opencode/openwork/agentlab/logs/`

---

## 9. Vescript (Hotel Copilot) — Current State

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SolidJS + Tailwind CSS v4 + Vite |
| State | `solid-js/store` (reactive signals) |
| Database | Convex (real-time cloud/local) |
| AI Layer | OpenCode skills + commands |
| Auth/Infra | None (demo mode) |

### Convex Schema (22 tables)

| Category | Tables |
|----------|--------|
| **Core** | `properties` (15 hotels), `regions` (3), `portfolio` (1) |
| **Rooms** | `rooms`, `housekeepingRooms`, `attendants` |
| **Guests** | `reservations`, `guestFeedback` |
| **Revenue** | `dailySummaries`, `compSets`, `dailyRates`, `nightAudits` |
| **Forecasting** | `forecasts`, `demandCalendar`, `marketEvents` |
| **Groups** | `groups` |
| **Financial** | `invoices`, `vendorContracts`, `expenseComparisons`, `portfolioKpis` |

### 10 Hotel Skills

| Skill | Persona Target |
|-------|---------------|
| `hotel-gm-briefing` | General Manager |
| `hotel-revenue-manager` | Revenue Manager |
| `hotel-district-manager` | District Manager |
| `hotel-forecasting` | Revenue Manager, Area RM |
| `hotel-group-booking` | Director of Sales |
| `hotel-invoice-review` | Controller / GM |
| `hotel-front-office` | Front Office Manager |
| `hotel-housekeeping` | Executive Housekeeper |
| `hotel-collaborative` | Cross-department meetings |
| `hotel-portfolio-analysis` | District Manager, SVP Ops |

### 10 Hotel Commands

`/morning-briefing`, `/rate-review`, `/portfolio-flash`, `/property-comparison`,
`/invoice-review`, `/forecast-90day`, `/demand-calendar`, `/group-analysis`,
`/displacement-analysis`, `/housekeeping-optimize`

### 11 Personas (Role-Based Views)

```
Property Scope:    GM, Revenue Manager, Director of Sales, Front Office Manager, Executive Housekeeper
Regional Scope:    District Manager, Area Revenue Manager, Regional Director of Sales
Corporate Scope:   SVP Operations, VP Revenue Management, VP Sales & Marketing
```

Each persona has:
- Specific tab set (e.g., GM sees Overview/Operations/Invoices/Groups)
- Default landing tab
- Scope level determining data breadth

### Frontend Pages

7 tab pages: Overview, Portfolio, Revenue, Forecast, Operations, Groups, Invoices

### Convex Client Integration

Custom SolidJS hooks wrapping Convex vanilla JS client:
- `useConvexQuery()` — reactive subscription with `"skip"` support
- `useConvexMutation()` — async mutation executor
- Singleton `ConvexClient` initialized from `VITE_CONVEX_URL`

---

## 10. What Needs to Change for Hotel-Focused MVP

### 10a. Skills & Commands — Already Done ✅

The vescript repo already has 10 hotel skills and 10 commands in proper `.opencode/skills/` and `.opencode/commands/` format. These are **directly compatible** with OpenWork's skill loader.

### 10b. Data Layer — Convex Integration Required

**Current state:** Vescript uses Convex as a standalone real-time database.

**Needed changes:**
1. Keep Convex as the hotel data backend (it's working well)
2. Expose Convex data to OpenCode AI skills via one of:
   - **MCP server** wrapping Convex queries (recommended — cleanest integration)
   - **Plugin** that makes Convex data available as tools
   - Skills that reference Convex query endpoints directly (current approach in SKILL.md — fragile)

**Recommended approach:** Build a `hotel-data-mcp` server that:
```jsonc
// opencode.json
{
  "mcp": {
    "hotel-data": {
      "type": "local",
      "command": ["bun", "run", "mcp/hotel-data-server.ts"]
    }
  }
}
```
Exposes tools like `get_property_summary`, `get_rate_position`, `get_group_pipeline`, `get_invoice_anomalies` etc.

### 10c. Frontend — Port or Embed

**Option A: Embed in OpenWork app** (recommended for full platform)
- Port `hotel-frontend/` into `packages/app/src/app/hotel/`
- Use OpenWork's navigation to add a `/hotel` route
- Leverage OpenWork's session management, permissions, and AI chat
- The HOTEL_COPILOT_DEMO.md already describes this path structure

**Option B: Standalone Vite app** (current state — good for demo)
- Keep as separate SolidJS app
- Communicate with OpenCode via SDK or REST API
- Missing: permissions, session management, audit trail

### 10d. Desktop App — Minimal Changes

If embedding in OpenWork:
1. Add hotel route to `packages/app/src/app/entry.tsx` routing
2. The hotel dashboard becomes a "workspace preset" or "vertical"
3. Skills/commands auto-load from `.opencode/` (no changes needed)
4. Convex client needs to be initialized alongside OpenCode client

### 10e. OpenCode Integration for AI

The skills currently describe Convex queries in their `## Context` sections but have no way to actually execute them during an AI session. The bridge options:

| Approach | Effort | Quality |
|----------|--------|---------|
| **MCP server** for hotel data | Medium | Best — tools show up in AI naturally |
| **Plugin** exposing query tools | Medium | Good — tighter OpenCode integration |
| **Inline in skills** (current) | Done | Fragile — AI must interpret file paths |
| **Scheduled tasks** seeding context | Low | Okay for briefings, not interactive |

### 10f. Persona System

OpenWork has no built-in persona concept. The hotel persona selector is:
- Purely a frontend concern (SolidJS store)
- Controls which tabs are visible and which is default
- Could be exposed as an OpenWork "workspace preset" or custom config

### 10g. Deployment Architecture for MVP

```
┌─────────────────────────────────────────────────┐
│              Hotel Copilot Desktop               │
│  ┌──────────────────────────────────────────┐    │
│  │    SolidJS App (OpenWork + Hotel UI)     │    │
│  │  ┌──────────┐  ┌─────────────────────┐  │    │
│  │  │ OpenWork │  │   Hotel Dashboard   │  │    │
│  │  │  Views   │  │   (persona-based)   │  │    │
│  │  └────┬─────┘  └──────────┬──────────┘  │    │
│  │       │                   │              │    │
│  │       ▼                   ▼              │    │
│  │  OpenCode SDK       Convex Client        │    │
│  └───────┬───────────────────┬──────────────┘    │
│          │                   │                   │
│  ┌───────▼────────┐  ┌──────▼──────┐            │
│  │  OpenCode      │  │  Convex     │            │
│  │  Server :4096  │  │  Cloud/Local│            │
│  └───────┬────────┘  └─────────────┘            │
│          │                                       │
│  ┌───────▼────────┐                              │
│  │  hotel-data    │                              │
│  │  MCP server    │  ← bridges Convex → OpenCode │
│  └────────────────┘                              │
│                                                  │
│  OpenWork Server :8787                           │
│  (skills, commands, permissions, audit)           │
└─────────────────────────────────────────────────┘
```

---

## 11. Extension Points Summary

### How to add a custom domain vertical (hotel, legal, medical, etc.)

1. **Skills** → `.opencode/skills/<domain>-*/SKILL.md`
   - Auto-discovered, no registration needed
   - Frontmatter: `name`, `description`, optional `trigger`
   - Body: `When to use`, `What to do`, `Context`, `Output format`

2. **Commands** → `.opencode/commands/<action>.md`
   - Auto-discovered, triggered via `/command-name`
   - Supports `$ARGUMENTS` template variable
   - Can reference skills by name

3. **MCP servers** → `opencode.json` → `mcp` section
   - Best for bridging external data sources (PMS, Convex, etc.)
   - Tools automatically available to AI sessions

4. **Plugins** → `.opencode/plugins/*.ts` or npm packages
   - Full TypeScript/JavaScript tool definitions
   - Can embed skill references

5. **Agents** → `.opencode/agents/*.md`
   - Custom agent definitions with different models/context
   - Can be targeted by commands

6. **Frontend** → `packages/app/src/app/<vertical>/`
   - SolidJS components, pages, state stores
   - Route registration in app entry
   - Share design system with OpenWork core

7. **Workspace presets** → Planned but not yet implemented
   - Would bundle skills + commands + MCP config into a distributable package

---

## 12. Key File Paths Reference

### OpenWork Server

| Purpose | Path |
|---------|------|
| Skills API | `packages/server/src/skills.ts` |
| Skill Hub | `packages/server/src/skill-hub.ts` |
| MCP config | `packages/server/src/mcp.ts` |
| Plugins | `packages/server/src/plugins.ts` |
| Commands | `packages/server/src/commands.ts` |
| Scheduler | `packages/server/src/scheduler.ts` |
| HTTP server + routes | `packages/server/src/server.ts` (~3700 lines) |
| Types | `packages/server/src/types.ts` |
| File watchers | `packages/server/src/reload-watcher.ts` |
| Workspace resolution | `packages/server/src/workspaces.ts` |
| File paths | `packages/server/src/workspace-files.ts` |

### Desktop App

| Purpose | Path |
|---------|------|
| Tauri main setup | `packages/desktop/src-tauri/src/lib.rs` |
| IPC commands | `packages/desktop/src-tauri/src/commands/` |
| Sidecar config | `packages/desktop/src-tauri/tauri.conf.json` |
| Sidecar prep | `packages/desktop/scripts/prepare-sidecar.mjs` |

### Frontend App

| Purpose | Path |
|---------|------|
| App entry | `packages/app/src/app/app.tsx` |
| Pages | `packages/app/src/app/pages/` |
| Components | `packages/app/src/app/components/` |
| State | `packages/app/src/app/state/` |
| OpenCode client | `packages/app/src/app/lib/opencode.ts` |

### Hotel Copilot (vescript)

| Purpose | Path |
|---------|------|
| Convex schema | `convex/schema.ts` |
| Convex queries | `convex/*.ts` (14 query/mutation files) |
| Seed data | `convex/seed.ts`, `convex/seedRooms.ts`, `convex/seedFinancial.ts` |
| Frontend dashboard | `hotel-frontend/hotel-dashboard.tsx` |
| Frontend pages | `hotel-frontend/pages/` (7 pages) |
| Frontend components | `hotel-frontend/components/` (18 components) |
| State store | `hotel-frontend/state/hotel-store.ts` |
| Types & personas | `hotel-frontend/data/hotel-types.ts` |
| Convex hooks | `hotel-frontend/data/hotel-data-service.ts` |
| Convex client | `hotel-frontend/data/convex-client.ts` |
| Hotel skills | `.opencode/skills/hotel-*/SKILL.md` (10 skills) |
| Hotel commands | `.opencode/commands/*.md` (10 commands) |
