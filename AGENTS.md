# AGENTS.md

## Cursor Cloud specific instructions

This is a **frontend-only SvelteKit 2 + Svelte 5 (Runes)** application — no databases, Docker, or backend services required.

### Running the app

See `CLAUDE.md` for all standard dev commands (`npm run dev`, `npm run build`, `npm run check`, `npm run test`, `bash scripts/lint-css.sh`).

### Non-obvious caveats

- **Dev server**: `npm run dev` starts on port 5173. Use `--host 0.0.0.0` when testing with a browser in the Cloud VM.
- **Build adapter**: Production build uses `@sveltejs/adapter-vercel`. The build output goes to `.vercel/output/` — this is expected and does not affect local dev.
- **svelte-check warnings**: The `toggle-group.svelte` component emits 3 `state_referenced_locally` warnings — these are benign and come from the `shadcn-svelte` UI library, not application code.
- **CSS oklch rule**: All CSS colors must use `oklch()`. CI rejects `#hex`, `rgb()`, and `hsl()`. Run `bash scripts/lint-css.sh` to verify before pushing.
