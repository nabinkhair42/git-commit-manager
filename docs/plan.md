# Implementation Plan

## Architecture

- Next.js app (App Router) with two modes: **Local** and **GitHub**
- **Local mode**: Repo path in URL params (`?path=/abs/path`), stateless, bookmarkable. API routes use `simple-git` for Git operations. Runs on localhost.
- **GitHub mode**: Authenticated via better-auth with GitHub OAuth (`repo` scope). Uses Octokit to read repositories from GitHub. Read-only (no write operations like reset, cherry-pick).
- SWR for client-side data fetching with cache invalidation after mutations
- Drizzle ORM with Neon Postgres for auth persistence (user, session, account tables)
- Dark mode default via `next-themes`
- Unified hooks layer that delegates to local or GitHub hooks based on mode

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Mode selector: enter local path or sign in with GitHub to browse remote repos |
| `/repo/commits` | Commit history with paginated table, search, filter by branch/author |
| `/repo/commits/[hash]` | Single commit detail with file diffs |
| `/repo/compare` | Compare two commits with diff viewer |
| `/repo/branches` | Branch management: list, create, switch, delete (local + remote), merge |
| `/repo/tags` | Tag management: list, create, delete, search/filter |
| `/repo/stash` | Stash management: save, apply, pop, drop, clear |

## API Endpoints

### Local Git API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/git/repo` | GET/POST | Validate repo path, get repo info |
| `/api/git/commits` | GET | Paginated commit list with search/filter |
| `/api/git/commits/[hash]` | GET | Single commit detail |
| `/api/git/diff` | GET | Diff between two commits |
| `/api/git/reset` | POST | Reset to commit (soft/mixed/hard) |
| `/api/git/cherry-pick` | POST | Cherry-pick commit(s) |
| `/api/git/revert` | POST | Revert commit(s) |
| `/api/git/branches` | GET/POST/DELETE | Branch CRUD (local + remote delete) |
| `/api/git/branches/checkout` | POST | Switch branch |
| `/api/git/branches/merge` | POST | Merge branch |
| `/api/git/status` | GET | Working tree status |
| `/api/git/browse` | GET | Filesystem directory browsing |
| `/api/git/tags` | GET/POST/DELETE | Tag CRUD |
| `/api/git/stash` | GET/POST/DELETE | Stash operations |

### GitHub API (proxied via Octokit)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/github/repos` | GET | List authenticated user's repos |
| `/api/github/commits` | GET | Commits for a GitHub repo |
| `/api/github/commits/[hash]` | GET | Single commit detail from GitHub |
| `/api/github/branches` | GET | Branches for a GitHub repo |
| `/api/github/tags` | GET | Tags for a GitHub repo |
| `/api/github/diff` | GET | Diff between two commits on GitHub |

### Auth

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...all]` | ALL | better-auth catch-all (login, callback, session) |

## Safety Tiers

| Level | Operations | Safeguard |
|-------|-----------|-----------|
| Safe (read-only) | log, diff, status, branch list | None |
| Moderate | cherry-pick, revert, merge, create branch/tag | Simple confirmation |
| Dangerous | soft/mixed reset, delete branch, delete tag | Confirmation dialog with warning |
| Critical | hard reset, force delete branch, delete remote branch | Typed confirmation required |

## File Structure

```
src/
  config/
    axios.ts              # Axios instance
    api-endpoints.ts      # Local git API endpoint URLs
    github-endpoints.ts   # GitHub API endpoint URLs
    constants.ts          # Constants and enums
  services/
    frontend/
      git.services.ts     # API calls for local git operations
      github.services.ts  # API calls for GitHub operations
    server/               # (Reserved for future server-side services)
  hooks/
    use-git/
      index.ts            # SWR hooks for local git data + mutations
    use-github/
      index.ts            # SWR hooks for GitHub data
    use-unified.ts        # Unified hooks that delegate by mode
    use-mode.tsx          # ModeProvider context (local | github)
    use-repo.ts           # Repo context (path, mode, owner, repoName)
    use-recent-repos.ts   # localStorage recent repos
    use-keyboard-shortcuts.ts  # Global keyboard navigation
  schemas/
    git.ts                # Zod schemas for validation
  lib/
    git/                  # Git backend (types, client, modules)
    github/
      client.ts           # Octokit service for GitHub API
    auth.ts               # better-auth server config
    auth-client.ts        # better-auth React client
    auth-helpers.ts       # Server-side auth helpers
    db/
      schema.ts           # Drizzle schema (user, session, account)
      index.ts            # Neon serverless + Drizzle connection
    response/
      server-response.ts  # Standardized API response helper
    formatters.ts         # Shared formatting utilities
    utils.ts              # shadcn utility
  components/
    ui/                   # shadcn components
    providers.tsx         # ThemeProvider, TooltipProvider, ModeProvider
    loaders/              # Loading skeletons
    repo/                 # Repo selector, layout, header
    commits/              # Commit list, detail
    branches/             # Branch management
    tags/                 # Tag management
    stash/                # Stash management
    diff/                 # Diff viewer, compare view
    shared/               # Confirmation dialogs
  app/
    layout.tsx            # Root layout with providers
    page.tsx              # Landing page (mode selector)
    repo/
      layout.tsx          # Repo layout with nav tabs
      commits/
        page.tsx
        [hash]/page.tsx
      compare/page.tsx
      branches/page.tsx
      tags/page.tsx
      stash/page.tsx
    api/
      auth/[...all]/route.ts  # better-auth handler
      git/                     # Local git API route handlers
      github/                  # GitHub API route handlers
```

## Database

- **Provider**: Neon Postgres (serverless)
- **ORM**: Drizzle ORM
- **Tables**: user, session, account, verification (managed by better-auth)
- **Scripts**: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push`, `pnpm db:studio`
- **Config**: `drizzle.config.ts` at project root

## Implementation Order

1. Scaffold project, install deps, configure shadcn/ui
2. Git backend library (`lib/git/`)
3. Server response helpers and API routes
4. Config files (axios, endpoints, constants)
5. Services and hooks
6. Layout and landing page
7. Commits UI (list, search/filter, row actions, detail page)
8. Diff UI (diff2html viewer, compare page)
9. Branches UI (list, create/delete/merge, local + remote delete)
10. Tags UI (list, create/delete)
11. Stash UI (list, save/apply/pop/drop/clear)
12. Auth + database setup (better-auth, Drizzle, Neon)
13. GitHub mode (Octokit client, GitHub API routes, services, hooks)
14. Unified hooks layer + mode switching UI
15. Polish (loading states, error handling, toasts, keyboard shortcuts)

## Verification

1. `pnpm dev` starts on localhost:3000
2. Enter a local git repo path, validates and opens
3. View commit history with pagination and search
4. Reset, cherry-pick, revert operations work with proper confirmations
5. Diff view shows file changes between commits
6. Branch management (create, switch, delete local/remote, merge) works
7. Tag management (create, delete, filter) works
8. Stash management (save, apply, pop, drop, clear) works
9. Sign in with GitHub, browse remote repos read-only
10. `pnpm build` completes without errors
