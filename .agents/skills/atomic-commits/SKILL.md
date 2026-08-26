---
name: atomic-commits
description: Stage and commit changes as atomic units — one logical change per commit. Use when the user says "commit", "atomic commit", "/atomic-commits", or asks to commit staged/unstaged changes cleanly.
---

An atomic commit captures exactly one logical change. It should pass lint, build, and tests on its own. A reviewer should be able to understand it without reading adjacent commits.

**Trigger:** User says "commit", "atomic commit", "/atomic-commits", or "commit my changes".

---

## Step 1 — Survey the Working Tree

Run these in parallel:

```bash
git status
git diff                    # unstaged
git diff --cached           # already staged
git log --oneline -5        # recent commit style reference
```

Read every modified file. Group changes by logical unit before touching `git add`.

---

## Step 2 — Group Changes into Logical Units

A logical unit is a change that:
- Has a single reason to exist ("why did this change?")
- Can be described in one sentence without "and"
- Would not break the app if landed alone

### Split rules

| Situation | Action |
|-----------|--------|
| Feature code + its test | One commit — they belong together |
| Feature A code + Feature B code | Two commits |
| New component + unrelated bug fix | Two commits |
| Refactor + behavior change | Two commits — refactor first |
| Token/style update + logic change | Two commits |
| Multiple files, same feature | One commit |
| `globals.css` token change + component using it | One commit if inseparable, two if independent |

### This project's common groupings

- `src/app/(auth)/` changes → auth commit
- `src/app/(dashboard)/<route>/` changes → per-route commit
- `src/components/ui/` shadcn updates → one UI primitives commit
- `src/app/globals.css` + `tokens.json` → design tokens commit
- `__tests__/` spec changes → testing commit
- `.agents/` config/skill/AC changes → tooling commit

---

## Step 3 — Stage Selectively

Stage by logical unit — never `git add .` or `git add -A`.

```bash
# Stage specific files
git add src/app/(dashboard)/chats/_components/chat-list.tsx
git add src/app/(dashboard)/chats/_components/chat-window.tsx

# Stage specific hunks within a file (when a file has two logical changes)
git add -p src/components/ui/button.tsx
```

Verify what is staged before committing:

```bash
git diff --cached --stat
```

---

## Step 4 — Write the Commit Message

### Format

```
<type>: <what changed, imperative, ≤72 chars>

<optional body — why, not what. Wrap at 72 chars.>
```

### Types

| Type | When |
|------|------|
| `feat` | New user-visible feature or page |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `style` | Tokens, CSS, visual-only changes |
| `test` | Adding or fixing tests / AC |
| `chore` | Config, tooling, `.agents/`, deps |
| `docs` | README, DESIGN.md, specs |

### Rules

- Imperative mood: "add chat list" not "added chat list"
- No period at the end of the subject line
- Subject answers: "if applied, this commit will **___**"
- Body answers: "why was this necessary?" — skip if obvious
- Never mention file names in the subject — describe the change, not the diff

### Examples

```
feat: add chat list with unread badge and last-message preview

feat: add 5-step bulk messages flow with schedule support

fix: sidebar collapse state not persisting on route change

style: apply border-border-subtle to all table card shells

refactor: extract StatusBadge into shared component

chore: add atomic-commits skill

test: add Playwright spec for /users super-admin view

docs: sync DESIGN.md with tokens.json and GUIDELINES.md
```

---

## Step 5 — Commit

```bash
git commit -m "$(cat <<'EOF'
<type>: <subject>

<optional body>
EOF
)"
```

---

## Step 6 — Repeat for Remaining Groups

After each commit, check `git status` again. Repeat Steps 2–5 for each remaining logical unit until the working tree is clean.

---

## Step 7 — Final Check

```bash
git log --oneline -10
```

Each commit should read as a clear, self-contained entry. If two adjacent commits could be described as "part 1 / part 2" they probably should be one commit.

---

## Hard Rules

- **Never** `git add .` or `git add -A` — always stage by file or hunk
- **Never** commit unrelated changes together
- **Never** commit broken code (a commit that fails lint/build mid-feature should be a WIP stash, not a commit)
- **Never** use `--no-verify` to skip hooks — fix the hook failure instead
- **Never** amend a commit that has already been pushed to a shared branch
- **Never** include `.env`, secrets, or large binaries