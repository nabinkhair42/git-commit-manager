# Implementation Plan

## Architecture

- Standalone Next.js app (separate from any other project, runs on localhost only)
- Repo path in URL params (`?path=/abs/path`), stateless and bookmarkable
- API routes (`/api/git/*`) use `simple-git` to execute Git operations
- SWR for client-side data fetching with cache invalidation after mutations
- No database. All state comes from Git. Only localStorage for recent repos and preferences.
- Dark mode default via `next-themes`

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Repo selector with path input and recent repos from localStorage |
| `/repo/commits` | Commit history with paginated table, search, filter by branch/author |
| `/repo/commits/[hash]` | Single commit detail with file diffs |
| `/repo/compare` | Compare two commits with diff viewer |
| `/repo/branches` | Branch management: list, create, switch, delete, merge |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/git/repo` | GET/POST | Validate repo path, get repo info |
| `/api/git/commits` | GET | Paginated commit list with search/filter |
| `/api/git/commits/[hash]` | GET | Single commit detail |
| `/api/git/diff` | GET | Diff between two commits |
| `/api/git/reset` | POST | Reset to commit (soft/mixed/hard) |
| `/api/git/cherry-pick` | POST | Cherry-pick commit(s) |
| `/api/git/revert` | POST | Revert commit(s) |
| `/api/git/branches` | GET/POST/DELETE | Branch CRUD |
| `/api/git/branches/checkout` | POST | Switch branch |
| `/api/git/branches/merge` | POST | Merge branch |
| `/api/git/status` | GET | Working tree status |

## Safety Tiers

| Level | Operations | Safeguard |
|-------|-----------|-----------|
| Safe (read-only) | log, diff, status, branch list | None |
| Moderate | cherry-pick, revert, merge, create branch | Simple confirmation |
| Dangerous | soft/mixed reset, delete branch | Confirmation dialog with warning |
| Critical | hard reset, force delete branch | Typed confirmation (type hash/name) |

## File Structure

```
src/
  config/
    axios.ts              # Axios instance
    api-endpoints.ts      # All API endpoint URLs
    constants.ts          # Constants and enums
  services/
    frontend/
      git.services.ts     # API calls for git operations
    server/
      git.ts              # Server-side git service using simple-git
  hooks/
    use-git/
      index.ts            # SWR hooks for git data
    use-repo.ts           # Repo context
    use-recent-repos.ts   # localStorage recent repos
  schemas/
    git.ts                # Zod schemas for validation
  lib/
    git/                  # Git backend (types, client, modules)
    response/
      server-response.ts  # Standardized API response helper
    formatters.ts         # Shared formatting utilities
    utils.ts              # shadcn utility
  components/
    ui/                   # shadcn components
    providers.tsx         # ThemeProvider, TooltipProvider
    loaders/              # Loading skeletons
    repo/                 # Repo selector, layout
    commits/              # Commit list, detail
    branches/             # Branch management
    diff/                 # Diff viewer
    shared/               # Confirmation dialogs
  app/
    layout.tsx            # Root layout with providers
    page.tsx              # Landing page
    repo/
      layout.tsx          # Repo layout with sidebar
      commits/
        page.tsx
        [hash]/page.tsx
      compare/page.tsx
      branches/page.tsx
    api/git/              # All API route handlers
```

## Implementation Order

1. Scaffold project, install deps, configure shadcn/ui
2. Git backend library (`lib/git/`)
3. Server response helpers and API routes
4. Config files (axios, endpoints, constants)
5. Services and hooks
6. Layout and landing page
7. Commits UI (list, search/filter, row actions, detail page)
8. Diff UI (diff2html viewer, compare page)
9. Branches UI (list, create/delete/merge dialogs)
10. Polish (loading states, error handling, toasts)

## Verification

1. `pnpm dev` starts on localhost:3000
2. Enter a local git repo path, validates and opens
3. View commit history with pagination and search
4. Reset, cherry-pick, revert operations work with proper confirmations
5. Diff view shows file changes between commits
6. Branch management (create, switch, delete, merge) works
7. `pnpm build` completes without errors
