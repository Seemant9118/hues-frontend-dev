# Project Instructions & Rules

## Component Refactoring Rule

Whenever requested to refactor, clean up, or optimize any React or Next.js component, automatically apply the **`component-refactoring`** skill (`.agents/skills/component-refactoring/SKILL.md`):

1. **Keep File Size Short & Readable**: Reduce container component sizes to under 200–350 lines.
2. **Extract Side Effects & API Queries**: Move all `useQuery`, `useMutation`, schema fetching, and option mappings into custom hooks inside a `hooks/` directory.
3. **Modularize Visual UI Sections**: Break distinct UI sections (Form inputs, Selectors, Table containers) into single-responsibility subcomponents inside a `components/` directory.
4. **Extract DataTable Columns**: Move complex table columns and row actions into a dedicated `use<Feature>TableColumns.js` hook.
5. **Use Lazy Initializers**: Wrap session storage reads and draft state calculations in `useState(() => ...)`.
6. **Strict Logic Parity**: Never alter business, API endpoints, payload structures, session storage keys, or prop contracts.
7. **Use Absolute Import Aliases**: Always use absolute path aliases (e.g., `@/components/ui/button`, `@/components/Modals/AddModal`) instead of deep relative paths (`../../`) when creating or moving subcomponents and custom hooks.
