# Convex Local Development Research

## Summary

**YES — Convex can run 100% locally without cloud authentication.** As of `convex@1.32.0`, the CLI includes a built-in local deployment feature (beta) that downloads and runs the open-source `convex-local-backend` binary on your machine. No cloud account, no login, no internet required after initial binary download.

---

## 1. Key Discovery: Anonymous Local Mode

Running `npx convex dev` without being logged in triggers **anonymous local deployment mode**. The CLI:

1. Downloads the `convex-local-backend` binary from GitHub Releases
2. Runs it locally on port 3210 (backend) and 3211 (HTTP actions)
3. Generates all `convex/_generated/` files
4. Pushes your Convex functions to the local backend
5. Serves a local dashboard on port 6790

### Verified Working Command

```bash
CONVEX_AGENT_MODE=anonymous npx convex dev --once --verbose
```

**Output (confirmed working in this repo):**
```
CONVEX_AGENT_MODE=anonymous mode is in beta, functionality may change in the future.
Downloading Convex backend binary
Downloading Convex dashboard
✔ Started running a deployment locally at http://127.0.0.1:3210 and saved its:
    name as CONVEX_DEPLOYMENT
    client URL as VITE_CONVEX_URL
    HTTP actions URL as VITE_CONVEX_SITE_URL
 to .env.local
✔ Convex functions ready! (1.82s)
```

### Generated `.env.local`
```
CONVEX_DEPLOYMENT=anonymous:anonymous-agent
VITE_CONVEX_URL=http://127.0.0.1:3210
VITE_CONVEX_SITE_URL=http://127.0.0.1:3211
```

---

## 2. `npx convex dev --help` — All Available Flags

### Visible flags:
| Flag | Description |
|------|-------------|
| `-v, --verbose` | Show full listing of changes |
| `--typecheck <mode>` | `enable`, `try`, `disable` (default: `try`) |
| `--typecheck-components` | Check TS in component implementations |
| `--codegen <mode>` | `enable`, `disable` (default: `enable`) |
| `--once` | Run once then stop (no watch) |
| `--until-success` | Retry until first success |
| `--run <functionName>` | Run a function after push |
| `--run-sh <command>` | Run shell command after push |
| `--tail-logs [mode]` | `always`, `pause-on-deploy`, `disable` |
| `--configure [choice]` | `new` or `existing` — re-configure project |
| `--env-file <envFile>` | Custom env file for deployment vars |

### Hidden flags (found in source code):
| Flag | Description |
|------|-------------|
| `--local` | **Force local deployment** regardless of last used backend |
| `--cloud` | Force cloud deployment |
| `--dev-deployment <mode>` | `local` or `cloud` (use with `--configure`) |
| `--team <slug>` | Team slug (with `--configure`) |
| `--project <slug>` | Project slug (with `--configure`) |
| `--prod` | Develop against production deployment |
| `--url <url>` | Direct deployment URL |
| `--admin-key <key>` | Admin key for direct access |
| `--local-cloud-port <port>` | Custom port for local backend |
| `--local-site-port <port>` | Custom port for HTTP actions |
| `--local-backend-version <version>` | Pin backend binary version |
| `--local-force-upgrade` | Force backend binary upgrade |
| `--skip-push` | Skip pushing functions |
| `--push-all-modules` | Push all modules (ignore hash cache) |
| `--debug-bundle-path` | Debug bundling |
| `--debug-node-apis` | Debug Node.js APIs |
| `--live-component-sources` | Live component sources |
| `--override-auth-url <url>` | Override auth URL |
| `--override-auth-client <id>` | Override auth client ID |
| `--override-auth-username` | Override auth username |
| `--override-auth-password` | Override auth password |

---

## 3. `npx convex --help` — All Commands

```
Commands:
  dev              Develop against a dev deployment, watching for changes
  deploy           Deploy to your prod deployment
  run              Run a function (query, mutation, or action)
  import           Import data from a file
  dashboard|dash   Open the dashboard in the browser
  docs             Open the docs in the browser
  logs             Watch logs from your deployment
  export           Export data to a ZIP file
  env              Set and view environment variables
  data             List tables and print data
  codegen          Generate backend type definitions
  update           Print update instructions
  logout           Log out of Convex
  function-spec    List function metadata
  insights         Show health insights
  disable-local-deployments  Stop using local deployment
  mcp              Model Context Protocol server [BETA]
```

### `npx convex disable-local-deployments --help`
```
Options:
  --global       Disable local deployments on this machine
  --undo-global  Re-enable local deployments on this machine
```

---

## 4. Open-Source Local Convex Runtime

### Binary: `convex-local-backend`

**Source:** https://github.com/get-convex/convex-backend  
**Downloads from:** `https://github.com/get-convex/convex-backend/releases/download/{version}/convex-local-backend-{platform}.zip`

The CLI automatically downloads the correct binary for your platform:
- `convex-local-backend-x86_64-unknown-linux-gnu.zip` (Linux x86_64)
- `convex-local-backend-aarch64-unknown-linux-gnu.zip` (Linux ARM64)
- `convex-local-backend-x86_64-apple-darwin.zip` (macOS Intel)
- `convex-local-backend-aarch64-apple-darwin.zip` (macOS Apple Silicon)
- `convex-local-backend-x86_64-pc-windows-msvc.zip` (Windows)

**Binary location:** `~/.cache/convex/binaries/{version}/convex-local-backend`  
**Downloaded version in this env:** `precompiled-2026-03-10-d9677dc`

### Backend Binary CLI Options

```
convex-local-backend [OPTIONS] [DB_SPEC]

Arguments:
  [DB_SPEC]  File path for SQLite (default: convex_local_backend.sqlite3)

Options:
  -d, --db <DB>                    Database driver [default: sqlite]
                                   Supported: sqlite, mysql-v5, postgres-v5, etc.
  -i, --interface <INTERFACE>      Host to bind [default: 0.0.0.0]
  -p, --port <PORT>                Backend port [default: 3210]
      --site-proxy-port <PORT>     HTTP actions port [default: 3211]
      --convex-origin <URL>        Public URL of backend
      --convex-site <URL>          Public URL of HTTP actions
      --convex-http-proxy <URL>    Proxy for Actions fetches (SSRF protection)
      --instance-name <NAME>       Instance name
      --instance-secret <SECRET>   Instance secret
      --local-storage <DIR>        File storage directory [default: convex_local_storage]
      --s3-storage                 Use S3 storage instead
      --disable-beacon             Disable telemetry
      --redact-logs-to-client      Redact logs (for production)
      --local-log-sink <PATH>      Local log file path
```

The backend supports **SQLite** (default), **PostgreSQL**, and **MySQL** as storage backends.

---

## 5. Self-Hosted Deployment Support

Convex also supports **self-hosted deployments** via environment variables:

```bash
# .env.local or .env
CONVEX_SELF_HOSTED_URL=http://your-convex-backend:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=your-admin-key
```

These can be passed via `--env-file` flag to `npx convex dev`.

---

## 6. Local Development Data Storage

When running locally, data is stored at:
```
.convex/local/default/
├── config.json                    # Ports, admin key, backend version
├── convex_local_backend.sqlite3   # All Convex data (tables, documents)
└── convex_local_storage/          # File storage
```

The `.convex/` directory is auto-gitignored (`.convex/.gitignore` with `/*`).

---

## 7. Generated Code Format

`npx convex dev` generates **JavaScript + TypeScript declarations** (not `.ts` files):

```
convex/_generated/
├── api.js          # Runtime code (exports api, internal, components)
├── api.d.ts        # Type declarations for all Convex functions
├── dataModel.d.ts  # Data model types from schema
├── server.js       # query, mutation, action, httpAction helpers
└── server.d.ts     # Type declarations for server helpers
```

The old `api.ts` stub is **replaced** by `api.js` + `api.d.ts`. The `convex/tsconfig.json` excludes `_generated/` from typechecking (it uses `"exclude": ["./_generated"]`).

**Note for this project:** The existing `convex/_generated/api.ts` stub will be deleted and replaced with the proper generated files. Imports like `import { api } from "../convex/_generated/api"` will continue to work because TypeScript resolves `.js` imports to `.d.ts` declarations.

---

## 8. How to Run the Full Stack Locally

### Quick Start (recommended)
```bash
# Terminal 1: Start Convex local backend + watch for changes
CONVEX_AGENT_MODE=anonymous npx convex dev

# Terminal 2: Start Vite dev server
npm run dev
```

The first run downloads the backend binary (~50MB) and creates `.env.local` automatically. Subsequent runs are instant.

### One-shot (CI/testing)
```bash
CONVEX_AGENT_MODE=anonymous npx convex dev --once
npm run dev
```

### With seed data
```bash
CONVEX_AGENT_MODE=anonymous npx convex dev --run api.seed.seedAll
```

### Custom ports
```bash
npx convex dev --local --local-cloud-port 4000 --local-site-port 4001
```

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `CONVEX_AGENT_MODE=anonymous` | Skip login prompt, go straight to local |
| `CONVEX_ALLOW_ANONYMOUS=false` | Disable anonymous mode (force login) |
| `CONVEX_TMPDIR=/path` | Override temp directory |

---

## 9. Local Dashboard

When running locally, a **web dashboard** is also available at:
```
http://127.0.0.1:6790/?d=anonymous-agent
```

This is a full Convex dashboard (downloaded alongside the backend) that lets you:
- Browse tables and documents
- Run functions
- View logs
- Manage data

---

## 10. Architecture Summary

```
┌─────────────────────────────────────────────┐
│  Browser (localhost:5173)                     │
│  React App + Convex Client                   │
│  VITE_CONVEX_URL=http://127.0.0.1:3210      │
└────────────────┬────────────────────────────┘
                 │ WebSocket + HTTP
                 ▼
┌─────────────────────────────────────────────┐
│  convex-local-backend (localhost:3210)        │
│  Open-source Rust binary                     │
│  SQLite storage at .convex/local/default/    │
│  HTTP Actions on localhost:3211              │
└─────────────────────────────────────────────┘
                 ▲
                 │ Push functions
┌─────────────────────────────────────────────┐
│  npx convex dev                              │
│  Watches convex/ directory                   │
│  Bundles + pushes on change                  │
│  Generates convex/_generated/                │
└─────────────────────────────────────────────┘
```

No Docker needed. No cloud account needed. Everything runs as native processes.

---

## 11. npm Package Versions

- **Installed:** `convex@1.32.0`
- **Latest stable:** `1.32.0`  
- **Latest alpha:** `1.32.1-alpha.3`
- Local deployment feature available since ~1.29.x

---

## 12. Key Files in convex npm Package

```
node_modules/convex/
├── bin/main.js                              # CLI entry point
├── dist/esm/cli/
│   ├── dev.js                               # `convex dev` command
│   ├── configure.js                         # Project configuration
│   └── lib/
│       ├── localDeployment/
│       │   ├── localDeployment.js           # Local (logged-in) deployment
│       │   ├── anonymous.js                 # Anonymous (no-login) deployment  
│       │   ├── run.js                       # Backend process management
│       │   ├── download.js                  # Binary download from GitHub
│       │   ├── upgrade.js                   # Version upgrade handling
│       │   ├── dashboard.js                 # Local dashboard server
│       │   ├── filePaths.js                 # State directory management
│       │   ├── bigBrain.js                  # Cloud API calls (deployment naming)
│       │   ├── utils.js                     # Port selection, helpers
│       │   └── errors.js                    # Error handling
│       └── deploymentSelection.js           # Deployment mode selection logic
```
