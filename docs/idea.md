# Git Commit Manager

## What It Is

A web-based GUI for managing Git repositories. Works in two modes: **Local** (connects to repos on your machine via simple-git) and **GitHub** (reads repos from your GitHub account via Octokit). Runs as a Next.js app.

## The Problem

Managing Git history through the CLI can be tedious and error-prone, especially for operations like:
- Resetting to a previous commit (soft/mixed/hard)
- Cherry-picking commits between branches
- Reverting specific commits
- Comparing diffs between arbitrary commits
- Managing branches (create, switch, delete local and remote, merge)
- Managing tags and stashes

These operations require remembering exact hashes, flags, and sequences. A single mistake with `git reset --hard` can lose work.

## The Solution

A polished dark-mode web UI that wraps Git operations with:
- Visual commit history with search and filtering
- Side-by-side diff viewing for any two commits
- Branch management with local and remote branch support (including remote branch deletion)
- Tag management (lightweight and annotated)
- Stash management (save, apply, pop, drop, clear)
- Safety tiers with appropriate confirmation dialogs (typed confirmation for destructive operations)
- Multi-repo support via URL parameters, bookmarkable views
- GitHub mode for read-only browsing of remote repositories with OAuth

## How It Works

**Local mode**: Standalone Next.js app running on localhost. Enter a repo path (with autocomplete), and it connects using `simple-git`. No cloud, all state comes from Git. Recent repos stored in localStorage.

**GitHub mode**: Sign in with GitHub OAuth. Browse your repositories, view commits, branches, tags, and diffs. Write operations are disabled (read-only). Auth managed by better-auth with Neon Postgres for session storage.

Each repo is identified by path (local) or owner/name (GitHub) in the URL, so multiple repos can be open in different tabs.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- simple-git (local Git operations)
- Octokit (GitHub API)
- better-auth (authentication with GitHub OAuth)
- Drizzle ORM + Neon Postgres (auth persistence)
- SWR (data fetching)
- diff2html (diff rendering)
- axios (HTTP client)
- zod (validation)
