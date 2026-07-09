# ds.dotui.org

A directory of how the best design systems are built — their color ramps,
semantic tokens, and conventions, captured as structured per-system data and
rendered by shared explorer components.

The data is never hand-authored: each system is snapshotted from a
machine-readable source (a pinned repo/npm release or a committed stylesheet)
and extracted into byte-deterministic `colors.json` files. See
[CLAUDE.md](./CLAUDE.md) for the data-pipeline rules.

## Stack

TanStack Start + Vite, React 19, Tailwind CSS v4, React Aria Components, Zod
schemas. Data-pipeline scripts run on `tsx`.

## Development

```bash
pnpm install
pnpm dev      # builds the data index, then vite dev on port 4445
```

`pnpm dev` runs `build:data` first, which validates all systems against the
schemas and regenerates `src/data/__generated__/index.json`.

## Commands

- `pnpm dev` — build the data index, then vite dev (port 4445).
- `pnpm build` — build the data index, then the production app.
- `pnpm snapshot|extract|drift <slug>` — the data pipeline (see CLAUDE.md).
- `pnpm build:data` / `check:data` — regenerate / validate the data index.
- `pnpm typecheck` — build the data index, then `tsc --noEmit`.
- `pnpm test` — vitest over the emitted data.
- `pnpm check` / `check:fix` — oxlint + oxfmt.
