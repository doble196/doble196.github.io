# AGENTS.md

Guidance for AI coding agents working in this repo.

## Repo role

Public portfolio site for **doble196** ([github.com/doble196](https://github.com/doble196)) — a static personal site served from GitHub Pages. Keep everything here public-clean: no internal infrastructure details, no private brands, no secrets.

## House rules

- Push to `main` directly. No feature branches for solo work.
- Rebase before push.
- Migrations are idempotent. Source of truth is the schema file, not migration scripts.
- Never commit secrets.
- No third-party CDNs.
- Don't name-drop competitors in code, commits, or copy.

## When making changes

1. Read `CLAUDE.md` at the repo root if present — it has the canonical architecture notes.
2. Prefer editing existing files over creating new ones.
3. Keep commits atomic; one logical change per commit.
4. Don't add comments that just describe what code does — only the *why* behind non-obvious decisions.
