# CLAUDE.md

Context for Claude Code when working in this repository.

## Project

`committee-hub` is a monorepo for a campus event and committee management system. It has two apps: `apps/api` (backend) and `apps/dashboard` (frontend).

## Key Commands

Run from repo root unless noted.

| Command | Description |
|---|---|
| `bun dev` | Start all apps in dev mode |
| `bun --cwd apps/api dev` | Start API only |
| `bun --cwd apps/dashboard dev` | Start dashboard only |
| `bun --cwd apps/api db:push` | Push schema to database |
| `bun --cwd apps/api db:generate` | Generate migration files |
| `bun --cwd apps/api db:migrate` | Run migrations |
| `bun --cwd apps/api db:studio` | Open Drizzle Studio |
| `bun fix` | Lint all apps |
| `bun typecheck` | Type check all apps |

## Architecture

- **Monorepo** with Bun workspaces. No Turborepo.
- **Backend** (`apps/api`): ElysiaJS + Drizzle ORM + PostgreSQL + better-auth
- **Frontend** (`apps/dashboard`): Vite + React + TanStack Router + TanStack Query + shadcn/ui + Zustand + Zod
- **Auth**: better-auth server lives in `apps/api/src/lib/auth.ts`, client in `apps/dashboard/src/lib/auth.ts`
- **Auth**: Google OAuth via better-auth. After login, users get `mahasiswa` role by default. Admin upgrades roles manually.

## Module Structure (apps/api)

Business modules follow the same pattern when business workflow complexity
justifies it: `route → service → repository`.

```
src/modules/<module>/
  <module>.route.ts      # Elysia plugin, defines HTTP endpoints
  <module>.service.ts    # Business logic
  <module>.repository.ts # Drizzle queries
  <module>.schema.ts     # Drizzle table schema
```

Modules: `committee`, `proposal`, `event`, `notification`, `admin`

Auth is handled directly by Better Auth in `apps/api/src/lib/auth.ts`; the auth
database tables live in `apps/api/src/db/auth.schema.ts`.

## Coding Conventions

- Use TypeScript strictly. No `any`.
- Validation with Zod or ElysiaJS typebox, not manual checks.
- Services do not import from other services or other module repositories directly; use their own repository or internal events.
- Notifications are triggered via an in-process event emitter, not direct service calls.
- Keep route handlers thin; business logic belongs in the service layer.
- Drizzle schemas are the single source of truth for data shape.
- Use `snake_case` for database columns, `camelCase` for TypeScript.

## What Not To Do

- Do not add Redis or any external message broker; notifications are in-process.
- Do not create a `packages/auth` workspace; auth server stays in `apps/api`.
- Do not add email/password auth; Google OAuth is the only login method.
- Do not bypass the service layer from a route handler for business workflows.
- Do not write raw SQL; use Drizzle query builder.
- Do not commit `.env` files.

## Environment Variables

See `apps/api/.env.example` and `apps/dashboard/.env.example` for required variables.

Key API vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
Key dashboard vars: `VITE_API_URL`


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun fix`
- **Check for issues**: `bun check`
- **Diagnose setup**: `bunx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Do not use Promise `.then()`, `.catch()`, or `.finally()` in app code
- Use the local `tryCatch` helper for expected async failures that should be handled as values
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.
