# Workflow

Git branching strategy, commit conventions, and PR process for committee-hub.

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. Protected. Only merged via PR. |
| `dev` | Integration branch. All feature branches merge here first. |
| `feat/<name>` | New feature development |
| `fix/<name>` | Bug fixes |
| `chore/<name>` | Tooling, config, dependency updates |
| `docs/<name>` | Documentation only |

Branch names use kebab-case. Example: `feat/proposal-approval-workflow`.

## Flow

```
feat/xxx  ──► dev ──► main
fix/xxx   ──►
```

1. Branch off from `dev`
2. Work on your branch
3. Open a PR to `dev` when ready
4. After review and merge, `dev` is merged to `main` for releases

Never push directly to `main` or `dev`.

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <short description>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
Scope: module name or app name (`api`, `dashboard`, `proposal`, `event`, etc.)

Examples:
- `feat(proposal): add multi-level approval workflow`
- `fix(auth): handle expired session on refresh`
- `chore(api): update drizzle to latest`
- `docs: add erd entity descriptions`

Keep the description short (under 72 chars). Use the commit body for more context if needed.

## Pull Requests

- PR title follows the same convention as commit messages
- PR must target `dev` (not `main`)
- Include a short description of what changed and why
- Link the related task or issue if applicable
- At least one team member must review before merging
- Resolve all comments before merging
- Squash and merge preferred to keep history clean

## PR Description Template

```
## What
Short summary of the change.

## Why
Why this change was needed.

## Notes
Anything reviewers should pay attention to. Migration steps, breaking changes, etc.
```

## Code Review Guidelines

- Review for correctness first, style second
- Leave specific actionable comments, not vague ones
- Approve only when you are confident the change works
- Use "Request Changes" if something must be fixed before merge
