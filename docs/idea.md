# Git Commit Manager

## What It Is

A standalone local developer tool that provides a web-based GUI for managing Git commits. It runs on localhost and connects to any local Git repository on your machine.

## The Problem

Managing Git history through the CLI can be tedious and error-prone, especially for operations like:
- Resetting to a previous commit (soft/mixed/hard)
- Cherry-picking commits between branches
- Reverting specific commits
- Comparing diffs between arbitrary commits
- Managing branches (create, switch, delete, merge)

These operations require remembering exact hashes, flags, and sequences. A single mistake with `git reset --hard` can lose work.

## The Solution

A polished dark-mode web UI that wraps Git operations with:
- Visual commit history with search and filtering
- Side-by-side diff viewing for any two commits
- Branch management with visual indicators
- Safety tiers with appropriate confirmation dialogs (typed confirmation for destructive operations like hard reset)
- Multi-repo support via URL parameters, so you can have multiple repos open in different tabs

## How It Works

- Standalone Next.js app running on localhost
- Repo path passed as a URL parameter, making it stateless and bookmarkable
- Server-side API routes use `simple-git` to execute Git operations
- Client-side uses SWR for data fetching with automatic cache invalidation after mutations
- No database needed, all state comes from Git itself
- Recent repos stored in localStorage for quick access

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- simple-git (Git CLI wrapper)
- SWR (data fetching)
- diff2html (diff rendering)
- axios (HTTP client)
- zod (validation)
