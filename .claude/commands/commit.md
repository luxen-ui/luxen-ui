---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Read, Write
description: Create a git commit (with optional changeset)
---

User context: $ARGUMENTS

## Context

- Status: !`git status`
- Diff: !`git diff HEAD`
- Queued changesets: !`ls .changeset/*.md 2>/dev/null | grep -v README`

## Rules

- Changeset: `patch` or `minor` only — **never `major`**. Skip if one is already queued for this change, or use `--empty` for no user-facing impact.
- If the user's confirmation reply contains "amend", amend the previous commit (`git commit --amend`) instead of creating a new one.

## Task

1. Draft the commit message and (if needed) a changeset.
2. Show the plan and **ask "Ok?" — wait for explicit confirmation** before staging/committing.
